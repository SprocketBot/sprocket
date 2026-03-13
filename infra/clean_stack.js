const fs = require('fs');
const stack = JSON.parse(fs.readFileSync('layer_2/stack.json', 'utf8'));

if (stack.deployment && stack.deployment.resources) {
    stack.deployment.resources = stack.deployment.resources.filter(r => {
        const urn = r.urn;
        if (urn.includes('fluent-service') || urn.includes('gatus-internal')) {
            console.log(`Removing resource: ${urn}`);
            return false;
        }
        return true;
    });
}

fs.writeFileSync('layer_2/stack_cleaned.json', JSON.stringify(stack, null, 2));
