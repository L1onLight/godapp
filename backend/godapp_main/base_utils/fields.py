from django.db import models

from base_utils.security import CipherManager


class FernetEncryptedCharField(models.CharField):
    """
    A CharField that encrypts its value before saving to the database
    and decrypts it when retrieving from the database.
    """

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return CipherManager.decrypt(value)

    def get_prep_value(self, value):
        if value is None:
            return value
        return CipherManager.encrypt(value)
