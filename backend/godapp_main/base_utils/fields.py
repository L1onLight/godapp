from django.db import models

from base_utils.security import CipherManager


class FernetEncryptedCharField(models.CharField):
    """
    A CharField that encrypts its value before saving to the database
    and decrypts it when retrieving from the database.
    """

    def get_prep_value(self, value):
        if value is None or CipherManager.is_encrypted(value):
            return value
        return CipherManager.encrypt(value)
