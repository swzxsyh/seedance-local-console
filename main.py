import json
import mimetypes
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, unquote, urlparse
from urllib.request import Request, urlopen


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"


def load_env() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env()


LOG_LEVELS = {"DEBUG": 10, "INFO": 20, "WARN": 30, "ERROR": 40}


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name, default, *, minimum=None, maximum=None):
    value = os.getenv(name, "").strip()
    if not value:
        return default
    try:
        number = int(value)
    except ValueError:
        return default
    if minimum is not None:
        number = max(minimum, number)
    if maximum is not None:
        number = min(maximum, number)
    return number


def env_log_level():
    value = os.getenv("SEEDANCE_LOG_LEVEL", "").strip().upper()
    if value in LOG_LEVELS:
        return value
    return "DEBUG" if env_bool("SEEDANCE_DEBUG_HTTP", True) else "INFO"


SEEDANCE_API_KEY = os.getenv("SEEDANCE_API_KEY", "").strip()
SEEDANCE_BASE_URL = os.getenv("SEEDANCE_BASE_URL", "").strip().rstrip("/")
ARK_ASSET_API_PREFIX = os.getenv("ARK_ASSET_API_PREFIX", "/v1/ark/assets").strip()
ARK_ASSET_API_STYLE = os.getenv("ARK_ASSET_API_STYLE", "path").strip().lower()
SEEDANCE_STANDARD_MODEL = os.getenv(
    "SEEDANCE_STANDARD_MODEL", "dreamina-seedance-2-0-260128"
).strip()
SEEDANCE_FAST_MODEL = os.getenv(
    "SEEDANCE_FAST_MODEL", "dreamina-seedance-2-0-fast-260128"
).strip()
SEEDANCE_DEFAULT_PROFILE = os.getenv("SEEDANCE_DEFAULT_PROFILE", "fast").strip().lower()
SEEDANCE_TIMEOUT_SECONDS = env_int("SEEDANCE_TIMEOUT_SECONDS", 120, minimum=1)
SEEDANCE_MAX_REQUEST_BYTES = env_int(
    "SEEDANCE_MAX_REQUEST_BYTES", 20 * 1024 * 1024, minimum=1024
)
SEEDANCE_LOG_LEVEL = env_log_level()
SEEDANCE_DEBUG_HTTP = SEEDANCE_LOG_LEVEL == "DEBUG"
SEEDANCE_DEBUG_SHOW_TOKEN = env_bool("SEEDANCE_DEBUG_SHOW_TOKEN", False)
SEEDANCE_USER_AGENT = os.getenv("SEEDANCE_USER_AGENT", "PostmanRuntime/7.43.0").strip()

MODEL_PROFILES = {
    "standard": {
        "label": "Standard SeeDance",
        "value": SEEDANCE_STANDARD_MODEL,
    },
    "fast": {
        "label": "Fast SeeDance",
        "value": SEEDANCE_FAST_MODEL,
    },
}

ARK_ASSET_ALLOWED_ACTIONS = {
    "CreateAssetGroup",
    "CreateAsset",
    "ListAssetGroups",
    "ListAssets",
    "GetAsset",
    "GetAssetGroup",
    "UpdateAssetGroup",
    "UpdateAsset",
    "DeleteAsset",
    "DeleteAssetGroup",
    "CreateVisualValidateSession",
    "GetVisualValidateResult",
}

ARK_ASSET_API_VERSION = "2024-01-01"


def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def should_log(level):
    return LOG_LEVELS.get(level, 20) >= LOG_LEVELS.get(SEEDANCE_LOG_LEVEL, 20)


def log_event(event, level="INFO", **fields):
    if not should_log(level):
        return
    parts = [f"[{now()}]", event]
    for key, value in fields.items():
        if value is None:
            continue
        if isinstance(value, (dict, list)):
            value = json.dumps(value, ensure_ascii=False)
        parts.append(f"{key}={value}")
    print(" ".join(parts), flush=True)


def mask_secret(value):
    if not value:
        return "<empty>"
    if len(value) <= 10:
        return value[:2] + "***"
    return value[:6] + "***" + value[-4:]


def summarize_response(data):
    if not isinstance(data, dict):
        return {"type": type(data).__name__}
    nested = data.get("data") if isinstance(data.get("data"), dict) else {}
    return {
        "task_id": extract_task_id(data),
        "status": data.get("status") or nested.get("status"),
        "code": data.get("code") or nested.get("code"),
        "has_data": "data" in data,
        "keys": sorted(data.keys())[:12],
    }


class RequestTooLarge(Exception):
    pass


def extract_task_id(data):
    if not isinstance(data, dict):
        return None
    nested = data.get("data") if isinstance(data.get("data"), dict) else {}
    return (
        data.get("task_id")
        or data.get("id")
        or data.get("taskId")
        or nested.get("task_id")
        or nested.get("id")
        or nested.get("taskId")
    )


def clean_dict(data):
    return {key: value for key, value in data.items() if value not in (None, "", [])}


def coerce_int(value):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def coerce_float(value):
    if value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return int(number) if number.is_integer() else number


def summarize_payload(payload):
    if not isinstance(payload, dict):
        return None
    summary = {
        key: payload.get(key)
        for key in (
            "model",
            "duration",
            "resolution",
            "width",
            "height",
            "fps",
            "ratio",
            "seed",
            "n",
            "response_format",
            "user",
        )
        if key in payload
    }
    summary["has_prompt"] = bool(payload.get("prompt"))
    summary["has_image"] = bool(payload.get("image"))
    summary["has_images"] = bool(payload.get("images"))
    summary["metadata_keys"] = sorted(payload.get("metadata", {}).keys()) if isinstance(payload.get("metadata"), dict) else []
    return summary


def parse_json_response(text, *, context, status=None, content_type=None):
    if not text:
        return {}

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        preview = text[:1000]
        log_event(
            "response_parse_error",
            context=context,
            status=status,
            content_type=content_type,
            preview=preview,
        )
        return {
            "detail": text,
            "raw_response": text,
            "content_type": content_type,
        }


def missing_config_response(name):
    log_event("config_error", message=f"{name} is missing")
    return 500, {
        "detail": f"Missing {name}. Copy .env.example to .env and fill your relay config."
    }


def upstream_request(method, path, payload=None):
    if not SEEDANCE_API_KEY:
        return missing_config_response("SEEDANCE_API_KEY")
    if not SEEDANCE_BASE_URL:
        return missing_config_response("SEEDANCE_BASE_URL")

    body = None
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    url = f"{SEEDANCE_BASE_URL}{path}"
    log_event(
        "upstream_request",
        method=method,
        url=url,
        api_key=mask_secret(SEEDANCE_API_KEY),
        payload=summarize_payload(payload),
    )

    request_headers = {
        "Authorization": f"Bearer {SEEDANCE_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": SEEDANCE_USER_AGENT,
    }
    safe_headers = dict(request_headers)
    if not SEEDANCE_DEBUG_SHOW_TOKEN:
        safe_headers["Authorization"] = f"Bearer {mask_secret(SEEDANCE_API_KEY)}"

    if SEEDANCE_DEBUG_HTTP:
        log_event("upstream_debug_headers", level="DEBUG", headers=safe_headers)
        log_event("upstream_debug_body", level="DEBUG", body=payload or {})

    request = Request(
        url,
        data=body,
        method=method,
        headers=request_headers,
    )
    try:
        with urlopen(request, timeout=SEEDANCE_TIMEOUT_SECONDS) as response:
            text = response.read().decode("utf-8", errors="replace")
            data = parse_json_response(
                text,
                context="upstream_request",
                status=response.status,
                content_type=response.headers.get_content_type(),
            )
            if SEEDANCE_DEBUG_HTTP:
                log_event("upstream_response", level="DEBUG", status=response.status, body=data)
            else:
                log_event(
                    "upstream_response",
                    status=response.status,
                    summary=summarize_response(data),
                )
            return response.status, data
    except HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(text)
        except json.JSONDecodeError:
            detail = text
        if SEEDANCE_DEBUG_HTTP:
            log_event("upstream_error", level="DEBUG", status=exc.code, body=detail)
        else:
            log_event(
                "upstream_error",
                level="WARN",
                status=exc.code,
                summary=summarize_response(detail),
            )
        return exc.code, {"detail": detail}
    except URLError as exc:
        log_event("upstream_network_error", reason=str(exc.reason))
        return 502, {"detail": str(exc.reason)}


def upstream_ark_asset_request(action, channel_id, payload=None):
    if not SEEDANCE_API_KEY:
        return missing_config_response("SEEDANCE_API_KEY")
    if not SEEDANCE_BASE_URL:
        return missing_config_response("SEEDANCE_BASE_URL")

    if action not in ARK_ASSET_ALLOWED_ACTIONS:
        return 400, {"detail": "unsupported ark asset action"}

    if not channel_id:
        return 400, {"detail": "channel_id is required"}

    body = json.dumps(payload or {}, ensure_ascii=False).encode("utf-8")
    prefix = ARK_ASSET_API_PREFIX if ARK_ASSET_API_PREFIX.startswith("/") else f"/{ARK_ASSET_API_PREFIX}"
    prefix = prefix.rstrip("/")

    if ARK_ASSET_API_STYLE == "query":
        url = (
            f"{SEEDANCE_BASE_URL}{prefix}/?Action={quote(action)}"
            f"&Version={quote(ARK_ASSET_API_VERSION)}"
        )
        url += f"&channel_id={quote(channel_id)}"
    else:
        # Path style is used by token endpoints like /v1/ark/assets/{Action}.
        url = f"{SEEDANCE_BASE_URL}{prefix}/{quote(action)}?channel_id={quote(channel_id)}"

    request_headers = {
        "Authorization": f"Bearer {SEEDANCE_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": SEEDANCE_USER_AGENT,
    }
    request_headers["X-Ark-Channel-Id"] = channel_id
    safe_headers = dict(request_headers)
    if not SEEDANCE_DEBUG_SHOW_TOKEN:
        safe_headers["Authorization"] = f"Bearer {mask_secret(SEEDANCE_API_KEY)}"

    log_event(
        "ark_asset_request",
        action=action,
        style=ARK_ASSET_API_STYLE,
        url=url,
    )
    if SEEDANCE_DEBUG_HTTP:
        log_event("ark_asset_debug_headers", level="DEBUG", action=action, headers=safe_headers)
        log_event("ark_asset_debug_body", level="DEBUG", action=action, body=payload or {})

    request = Request(url, data=body, method="POST", headers=request_headers)
    try:
        with urlopen(request, timeout=SEEDANCE_TIMEOUT_SECONDS) as response:
            text = response.read().decode("utf-8", errors="replace")
            data = parse_json_response(
                text,
                context="upstream_ark_asset_request",
                status=response.status,
                content_type=response.headers.get_content_type(),
            )
            if SEEDANCE_DEBUG_HTTP:
                log_event("ark_asset_response", level="DEBUG", action=action, status=response.status, body=data)
            else:
                log_event(
                    "ark_asset_response",
                    action=action,
                    status=response.status,
                    summary=summarize_response(data),
                )
            return response.status, data
    except HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(text)
        except json.JSONDecodeError:
            detail = text
        if SEEDANCE_DEBUG_HTTP:
            log_event("ark_asset_error", level="DEBUG", action=action, status=exc.code, body=detail)
        else:
            log_event(
                "ark_asset_error",
                level="WARN",
                action=action,
                status=exc.code,
                summary=summarize_response(detail),
            )
        return exc.code, {"detail": detail}
    except URLError as exc:
        log_event("ark_asset_network_error", action=action, reason=str(exc.reason))
        return 502, {"detail": str(exc.reason)}


def resolve_model(model_or_profile):
    value = str(model_or_profile or "").strip()
    profile = MODEL_PROFILES.get(value.lower())
    if profile:
        return profile["value"]
    return value or MODEL_PROFILES.get(SEEDANCE_DEFAULT_PROFILE, MODEL_PROFILES["fast"])["value"]


class Handler(BaseHTTPRequestHandler):
    server_version = "SeeDanceGateway/0.1"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, format, *args):
        message = format % args
        log_event("http_access", client=self.client_address[0], message=message)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path):
        if path == "/":
            file_path = STATIC_DIR / "index.html"
        else:
            relative = unquote(path.removeprefix("/static/"))
            file_path = (STATIC_DIR / relative).resolve()
            try:
                file_path.relative_to(STATIC_DIR.resolve())
            except ValueError:
                self.send_error(403)
                return

        if not file_path.exists() or not file_path.is_file():
            self.send_error(404)
            return

        content = file_path.read_bytes()
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def read_json(self):
        raw_length = self.headers.get("Content-Length", "0").strip()
        try:
            length = int(raw_length or "0")
        except ValueError as exc:
            raise ValueError("Invalid Content-Length") from exc
        if length < 0:
            raise ValueError("Invalid Content-Length")
        if length > SEEDANCE_MAX_REQUEST_BYTES:
            raise RequestTooLarge(
                f"Request body is too large. Limit is {SEEDANCE_MAX_REQUEST_BYTES} bytes."
            )
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw or "{}")

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/" or path.startswith("/static/"):
            self.send_file(path)
            return

        if path == "/api/config":
            self.send_json(
                200,
                {
                    "base_url": SEEDANCE_BASE_URL,
                    "default_profile": SEEDANCE_DEFAULT_PROFILE
                    if SEEDANCE_DEFAULT_PROFILE in MODEL_PROFILES
                    else "fast",
                    "models": [
                        {
                            "label": MODEL_PROFILES["standard"]["label"],
                            "value": "standard",
                        },
                        {
                            "label": MODEL_PROFILES["fast"]["label"],
                            "value": "fast",
                        },
                    ],
                },
            )
            return

        prefix = "/api/video/generations/"
        if path.startswith(prefix):
            task_id = unquote(path[len(prefix) :])
            status, data = upstream_request("GET", f"/v1/video/generations/{task_id}")
            self.send_json(status, data)
            return

        self.send_error(404)

    def do_POST(self):
        path = urlparse(self.path).path
        asset_prefix = "/api/ark/assets/"
        if path.startswith(asset_prefix):
            action = unquote(path[len(asset_prefix) :]).strip()
            query = urlparse(self.path).query
            params = parse_qs(query, keep_blank_values=True)
            channel_id = (
                (params.get("channel_id") or [""])[0].strip()
                or self.headers.get("X-Ark-Channel-Id", "").strip()
            )

            try:
                request = self.read_json()
            except RequestTooLarge as exc:
                self.send_json(413, {"detail": str(exc)})
                return
            except (ValueError, UnicodeDecodeError) as exc:
                self.send_json(400, {"detail": str(exc)})
                return
            except json.JSONDecodeError as exc:
                self.send_json(400, {"detail": f"Invalid JSON: {exc}"})
                return

            status, data = upstream_ark_asset_request(action, channel_id, request)
            self.send_json(status, data)
            return

        if path != "/api/video/generations":
            self.send_error(404)
            return

        try:
            request = self.read_json()
        except RequestTooLarge as exc:
            self.send_json(413, {"detail": str(exc)})
            return
        except (ValueError, UnicodeDecodeError) as exc:
            self.send_json(400, {"detail": str(exc)})
            return
        except json.JSONDecodeError as exc:
            self.send_json(400, {"detail": f"Invalid JSON: {exc}"})
            return

        prompt = str(request.get("prompt") or "").strip()
        if not prompt:
            self.send_json(400, {"detail": "prompt is required"})
            return

        payload = {
            "model": resolve_model(request.get("model")),
            "prompt": prompt,
        }
        log_event(
            "create_video_task",
            profile=request.get("model"),
            resolved_model=payload["model"],
            prompt_length=len(prompt),
        )

        image = str(request.get("image") or request.get("image_url") or "").strip()
        images = request.get("images")
        if isinstance(images, list):
            images = [str(item).strip() for item in images if str(item).strip()]
        else:
            images = []

        if image and images:
            self.send_json(400, {"detail": "Use either image or images, not both."})
            return

        image_count = len(image) if isinstance(image, list) else (1 if image else 0)
        image_count += len(images)
        if image_count > 12:
            self.send_json(400, {"detail": "image inputs support at most 12 items"})
            return

        if image:
            payload["image"] = image
        if images:
            payload["images"] = images

        numeric_fields = {
            "duration": coerce_float(request.get("duration")),
            "width": coerce_int(request.get("width")),
            "height": coerce_int(request.get("height")),
            "fps": coerce_int(request.get("fps")),
            "seed": coerce_int(request.get("seed")),
            "n": coerce_int(request.get("n")),
        }
        payload.update(clean_dict(numeric_fields))

        for key in ("resolution", "response_format", "user"):
            value = str(request.get(key) or "").strip()
            if value:
                payload[key] = value

        ratio = str(request.get("ratio") or "").strip()
        if ratio:
            payload["ratio"] = ratio

        metadata = request.get("metadata")
        metadata = metadata if isinstance(metadata, dict) else {}
        if metadata:
            payload["metadata"] = metadata

        extra = request.get("extra")
        if isinstance(extra, dict):
            payload.update(extra)

        status, data = upstream_request("POST", "/v1/video/generations", payload)
        task_id = extract_task_id(data)
        if status >= 400:
            self.send_json(
                status,
                {
                    "ok": False,
                    "message": "Upstream video generation request failed.",
                    "upstream_status": status,
                    "upstream_error": data.get("detail", data) if isinstance(data, dict) else data,
                },
            )
            return
        self.send_json(status, {"ok": True, "task_id": task_id, "raw": data})


if __name__ == "__main__":
    host = "127.0.0.1"
    port = env_int("PORT", 8000, minimum=1, maximum=65535)
    log_event(
        "server_start",
        url=f"http://{host}:{port}",
        base_url=SEEDANCE_BASE_URL,
        standard_model=SEEDANCE_STANDARD_MODEL,
        fast_model=SEEDANCE_FAST_MODEL,
        default_profile=SEEDANCE_DEFAULT_PROFILE,
        log_level=SEEDANCE_LOG_LEVEL,
        max_request_bytes=SEEDANCE_MAX_REQUEST_BYTES,
    )
    ThreadingHTTPServer((host, port), Handler).serve_forever()
