# Django Ninja crud view for VaultEntry
from django.shortcuts import get_object_or_404
from ninja import Router

from vault.models import VaultEntry
from vault.schemas import VaultEntryCreateSchema, VaultEntrySchema

vault_router = Router(tags=["Vault Entries"])


@vault_router.get("/vault-entries/", response=list[VaultEntrySchema])
def list_vault_entries(request):
    """List all vault entries."""
    entries = VaultEntry.objects.all()
    return entries


@vault_router.get("/vault-entries/{entry_id}/", response=VaultEntrySchema)
def get_vault_entry(request, entry_id: int):
    """Retrieve a specific vault entry by ID."""
    entry = get_object_or_404(VaultEntry, id=entry_id)
    return entry


@vault_router.post("/vault-entries/", response=VaultEntrySchema)
def create_vault_entry(request, payload: VaultEntryCreateSchema):
    """Create a new vault entry."""
    entry = VaultEntry.objects.create(**payload.dict())
    return entry


@vault_router.put("/vault-entries/{entry_id}/", response=VaultEntrySchema)
def update_vault_entry(request, entry_id: int, payload: VaultEntryCreateSchema):
    """Update an existing vault entry."""
    entry = get_object_or_404(VaultEntry, id=entry_id)
    for attr, value in payload.dict().items():
        setattr(entry, attr, value)
    entry.save()
    return entry
