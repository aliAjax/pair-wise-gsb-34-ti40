from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES


class HandoverServiceError(Exception):
    """交接业务异常：service 层抛出，controller 层负责转成错误响应。"""

    def __init__(self, code: str, **fmt):
        self.code = code
        template = ERROR_MESSAGES.get(code, ERROR_MESSAGES["VALIDATION_FAILED"])
        message = template.format(**fmt) if fmt else template
        super().__init__(message)


def ensure(value: bool, code: str, **fmt):
    if not value:
        raise HandoverServiceError(code, **fmt)


def error_code(code: str) -> str:
    return ERROR_CODES.get(code, code)
