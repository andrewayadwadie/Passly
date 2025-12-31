"""initial

Revision ID: 1a1a1a1a1a1a
Revises: 
Create Date: 2025-12-31 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a1a1a1a1a1a'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    op.create_table('vault_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('account_name', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=2048), nullable=True),
        sa.Column('login', sa.String(length=255), nullable=True),
        sa.Column('password_encrypted', sa.Text(), nullable=False),
        sa.Column('password_nonce', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'account_name', name='_user_account_uc')
    )
    op.create_index(op.f('ix_vault_items_account_name'), 'vault_items', ['account_name'], unique=False)
    op.create_index(op.f('ix_vault_items_user_id'), 'vault_items', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_vault_items_user_id'), table_name='vault_items')
    op.drop_index(op.f('ix_vault_items_account_name'), table_name='vault_items')
    op.drop_table('vault_items')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_table('users')
