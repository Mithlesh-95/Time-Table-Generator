from rest_framework.renderers import JSONRenderer
from rest_framework.views import exception_handler
from rest_framework.response import Response


class CustomJSONRenderer(JSONRenderer):
    charset = "utf-8"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        # Pass through for non-Response (e.g., StreamingHttpResponse)
        if renderer_context is None:
            return super().render(data, accepted_media_type, renderer_context)

        response = renderer_context.get("response")
        success = response is not None and 200 <= response.status_code < 300

        # If DRF pagination provided 'results'
        if isinstance(data, dict) and "results" in data and "count" in data:
            page = renderer_context.get("request").query_params.get("page", 1)
            limit = renderer_context.get(
                "request").query_params.get("page_size", 20)
            wrapped = {
                "success": success,
                "data": data.get("results", []),
                "pagination": {
                    "page": int(page),
                    "limit": int(limit),
                    "total": data.get("count", 0),
                    "totalPages": (data.get("count", 0) + int(limit) - 1) // int(limit),
                },
            }
            return super().render(wrapped, accepted_media_type, renderer_context)

        if isinstance(data, dict) and ("detail" in data or "errors" in data):
            # error case
            wrapped = {"success": False, "data": None, "message": data.get(
                "detail"), "errors": data.get("errors")}
            return super().render(wrapped, accepted_media_type, renderer_context)

        wrapped = {"success": success, "data": data}
        return super().render(wrapped, accepted_media_type, renderer_context)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None and isinstance(response.data, dict):
        response.data = {"success": False, "data": None, "message": response.data.get(
            "detail"), "errors": response.data}
    return response
