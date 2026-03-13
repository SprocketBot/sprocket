VAULT_PLATFORM_TOKEN_URN='urn:pulumi:layer_2::layer_2::SprocketBot:VaultPolicies:Backend$vault:index/token:Token::policies-platform-token'
VAULT_INFRA_TOKEN_URN='urn:pulumi:layer_2::layer_2::SprocketBot:VaultPolicies:Backend$vault:index/token:Token::policies-infra-token'


pulumi up --target-replace $VAULT_INFRA_TOKEN_URN --skip-preview
pulumi up --target-replace $VAULT_PLATFORM_TOKEN_URN --skip-preview
pulumi up
