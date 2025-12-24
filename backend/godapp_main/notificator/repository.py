from notificator.models import NotificatorSettings


class NotificatorSettingsRepository:
    _model = NotificatorSettings

    @classmethod
    def get_for_user(cls, user_id: int) -> NotificatorSettings:
        return cls._model.objects.get(user__id=user_id)
