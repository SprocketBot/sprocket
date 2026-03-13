const fs = require('fs');
const stack = JSON.parse(fs.readFileSync('platform/stack.json', 'utf8'));

if (stack.deployment && stack.deployment.resources) {
    stack.deployment.resources = stack.deployment.resources.filter(r => {
        const type = r.type;
        const urn = r.urn;
        
        // Remove resources associated with old Docker provider or Vault
        if (type === 'docker:index/service:Service' || 
            type === 'docker:index/volume:Volume' ||
            type === 'docker:index/serviceConfig:ServiceConfig' ||
            type === 'docker:index/secret:Secret' ||
            type === 'vault:generic/secret:Secret' ||
            type === 'SprocketBot:Components:VaultBackedPassword' ||
            // Remove Vault provider itself if present (though usually top level)
            type === 'pulumi:providers:vault') {
            console.log(`Removing resource: ${urn}`);
            return false;
        }
        return true;
    });
}

fs.writeFileSync('platform/stack_cleaned.json', JSON.stringify(stack, null, 2));