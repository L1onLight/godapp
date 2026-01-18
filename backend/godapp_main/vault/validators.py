from abc import ABC, abstractmethod

from django.core.exceptions import ValidationError


class EntryValidator(ABC):
    @abstractmethod
    def validate(self, data: dict) -> bool:
        pass

    @staticmethod
    def _pre_validate(data: dict) -> bool:
        if not data:
            raise ValidationError("Data cannot be empty")
        return True


class PasswordEntryValidator(EntryValidator):
    def validate(self, data: dict) -> bool:
        self._pre_validate(data)

        required_fields = {"username", "password", "url"}
        return required_fields.issubset(data.keys())


class TokenEntryValidator(EntryValidator):
    def validate(self, data: dict) -> bool:
        self._pre_validate(data)
        required_fields = {"token", "service_name"}
        return required_fields.issubset(data.keys())


class SSHKeyEntryValidator(EntryValidator):
    def validate(self, data: dict) -> bool:
        self._pre_validate(data)
        required_fields = {"private_key"}
        return required_fields.issubset(data.keys())


class VaultEntryValidatorFactory:
    @staticmethod
    def get_validator(entry_type: str) -> EntryValidator:
        match entry_type:
            case "password":
                return PasswordEntryValidator()
            case "token":
                return TokenEntryValidator()
            case "ssh_key":
                return SSHKeyEntryValidator()
            case _:
                raise ValueError("Invalid vault item type")
