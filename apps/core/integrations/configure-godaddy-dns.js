const https = require('https');
const readline = require('readline');

// GoDaddy API Configuration
const GODADDY_API_KEY = 'dKD7eEsrwY6x_D8Uze31RdTNyX66c9BdUhz';
const GODADDY_SECRET = 'KTBqgbvRxq1XWkV5WKtjNR';
const DOMAIN = 'rangoons.live'; // Your actual GoDaddy domain
const STATIC_IP = '154.57.212.38';

// GoDaddy API endpoints
const GODADDY_API_BASE = 'https://api.godaddy.com/v1';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Prompt user for domain confirmation
function promptForDomain() {
    return new Promise((resolve) => {
        log('', 'reset');
        log('🌐 GoDaddy Domain Configuration', 'bright');
        log('================================', 'bright');
        log('', 'reset');
        logInfo(`Current domain: ${DOMAIN}`);
        logInfo(`Static IP: ${STATIC_IP}`);
        logInfo(`API Key: ${GODADDY_API_KEY.substring(0, 20)}...`);
        log('', 'reset');
        
        rl.question(`Is ${DOMAIN} correct? (y/n): `, (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                logSuccess('Domain confirmed!');
                resolve(DOMAIN);
            } else {
                rl.question('Enter your GoDaddy domain (e.g., rangoons.com): ', (newDomain) => {
                    if (newDomain.trim()) {
                        logSuccess(`Domain set to: ${newDomain.trim()}`);
                        resolve(newDomain.trim());
                    } else {
                        logError('Domain cannot be empty!');
                        resolve(DOMAIN);
                    }
                });
            }
        });
    });
}

// Make HTTPS request to GoDaddy API
function makeGodaddyRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.godaddy.com',
            port: 443,
            path: `/v1${endpoint}`,
            method: method,
            headers: {
                'Authorization': `sso-key ${GODADDY_API_KEY}:${GODADDY_SECRET}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Rangoons-DNS-Config/1.0'
            }
        };

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }

        logInfo(`Making ${method} request to: ${endpoint}`);
        if (data) {
            logInfo(`Request data: ${JSON.stringify(data)}`);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            
            logInfo(`Response status: ${res.statusCode} ${res.statusMessage}`);
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                logInfo(`Response body: ${responseData.substring(0, 200)}${responseData.length > 200 ? '...' : ''}`);
                
                if (res.statusCode === 401) {
                    logError('❌ 401 Unauthorized - API credentials are invalid');
                    reject(new Error('Invalid API credentials'));
                    return;
                }
                
                if (res.statusCode === 403) {
                    logError('❌ 403 Forbidden - API key may not have permission for this domain');
                    reject(new Error('API key permission denied'));
                    return;
                }
                
                if (res.statusCode === 404) {
                    logError('❌ 404 Not Found - Domain may not exist or API key has no access');
                    reject(new Error('Domain not found or no access'));
                    return;
                }
                
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                    return;
                }
                
                try {
                    if (responseData.trim()) {
                        const parsed = JSON.parse(responseData);
                        resolve(parsed);
                    } else {
                        resolve({});
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test API credentials
async function testAPICredentials() {
    try {
        logInfo('🧪 Testing GoDaddy API credentials...');
        const response = await makeGodaddyRequest('/domains');
        
        if (Array.isArray(response)) {
            logSuccess(`✅ API credentials are valid! Found ${response.length} domains`);
            return true;
        } else {
            logError(`❌ API test failed: Unexpected response format`);
            return false;
        }
    } catch (error) {
        logError(`❌ API test error: ${error.message}`);
        return false;
    }
}

// Get current DNS records
async function getCurrentDNSRecords(domain) {
    try {
        logInfo(`Fetching current DNS records for ${domain}...`);
        const response = await makeGodaddyRequest(`/domains/${domain}/records`);
        
        if (Array.isArray(response)) {
            logSuccess(`Found ${response.length} DNS records`);
            return response;
        } else {
            logError(`Failed to retrieve DNS records: Unexpected response format`);
            return [];
        }
    } catch (error) {
        logError(`Error retrieving DNS records: ${error.message}`);
        return [];
    }
}

// Create or update DNS record
async function createOrUpdateDNSRecord(domain, record) {
    try {
        const endpoint = `/domains/${domain}/records/${record.type}/${record.name || '@'}`;
        
        // GoDaddy API expects array of records
        const recordData = [{
            data: record.content,
            ttl: parseInt(record.ttl),
            name: record.name || '@',
            type: record.type
        }];
        
        const response = await makeGodaddyRequest(endpoint, 'PUT', recordData);
        
        logSuccess(`DNS record ${record.name || '@'} (${record.type}) → ${record.content}`);
        return true;
    } catch (error) {
        logError(`Error creating/updating DNS record: ${error.message}`);
        return false;
    }
}

// Configure DNS records for Rangoons
async function configureRangoonsDNS(domain) {
    log('🚀 Configuring DNS Records for Rangoons Edge Computing System', 'bright');
    log('================================================================', 'bright');
    
    // Test API credentials first
    const credentialsValid = await testAPICredentials();
    if (!credentialsValid) {
        logError('❌ API credentials test failed. Please check your keys and try again.');
        return false;
    }
    
    // Get current records
    const currentRecords = await getCurrentDNSRecords(domain);
    
    // Define required DNS records
    const requiredRecords = [
        {
            name: '@',
            type: 'A',
            content: STATIC_IP,
            ttl: '600'
        },
        {
            name: 'www',
            type: 'A',
            content: STATIC_IP,
            ttl: '600'
        }
    ];
    
    logInfo('Required DNS records:');
    requiredRecords.forEach(record => {
        log(`   ${record.name || '@'} (${record.type}) → ${record.content}`, 'cyan');
    });
    
    // Check if records already exist and update/create as needed
    let successCount = 0;
    
    for (const requiredRecord of requiredRecords) {
        const existingRecord = currentRecords.find(record => 
            record.name === (requiredRecord.name || '@') && record.type === requiredRecord.type
        );
        
        if (existingRecord) {
            if (existingRecord.data === requiredRecord.content) {
                logSuccess(`Record already correct: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
                successCount++;
            } else {
                logWarning(`Updating existing record: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
                if (await createOrUpdateDNSRecord(domain, requiredRecord)) {
                    successCount++;
                }
            }
        } else {
            logInfo(`Creating new record: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
            if (await createOrUpdateDNSRecord(domain, requiredRecord)) {
                successCount++;
            }
        }
    }
    
    // Summary
    log('', 'reset');
    log('📊 DNS Configuration Summary', 'bright');
    log('============================', 'bright');
    log(`Total records processed: ${requiredRecords.length}`, 'cyan');
    log(`Successful: ${successCount}`, 'green');
    log(`Failed: ${requiredRecords.length - successCount}`, 'red');
    
    if (successCount === requiredRecords.length) {
        log('', 'reset');
        logSuccess('🎉 DNS configuration completed successfully!');
        log('', 'reset');
        log('📋 Next Steps:', 'bright');
        log('1. Wait for DNS propagation (15 minutes to 48 hours)', 'cyan');
        log('2. Configure router port forwarding (80→8080, 443→8080)', 'cyan');
        log(`3. Test with: http://www.${domain}`, 'cyan');
        log('4. Your edge computing system will be accessible externally!', 'cyan');
        
        log('', 'reset');
        log('🔍 Test DNS propagation:', 'bright');
        log(`   nslookup www.${domain}`, 'cyan');
        log(`   ping www.${domain}`, 'cyan');
        log(`   curl -I http://www.${domain}`, 'cyan');
        
        return true;
    } else {
        logError('❌ Some DNS records failed to configure');
        return false;
    }
}

// Test DNS resolution
async function testDNSResolution(domain) {
    log('', 'reset');
    log('🧪 Testing DNS Resolution', 'bright');
    log('==========================', 'bright');
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
        exec(`nslookup www.${domain}`, (error, stdout, stderr) => {
            if (error) {
                logError(`DNS lookup failed: ${error.message}`);
                resolve(false);
                return;
            }
            
            if (stdout.includes(STATIC_IP)) {
                logSuccess(`✅ DNS resolution working: www.${domain} → ${STATIC_IP}`);
                resolve(true);
            } else {
                logWarning(`⚠️  DNS not yet propagated or incorrect`);
                logInfo(`Expected: ${STATIC_IP}`);
                logInfo(`Output: ${stdout}`);
                resolve(false);
            }
        });
    });
}

// Main execution
async function main() {
    try {
        log('🌐 Rangoons GoDaddy DNS Configuration Tool', 'bright');
        log('============================================', 'bright');
        log(`Static IP: ${STATIC_IP}`, 'cyan');
        log(`GoDaddy API: ${GODADDY_API_KEY.substring(0, 20)}...`, 'cyan');
        log('', 'reset');
        
        // Prompt for domain confirmation
        const confirmedDomain = await promptForDomain();
        
        // Configure DNS
        const dnsSuccess = await configureRangoonsDNS(confirmedDomain);
        
        if (dnsSuccess) {
            // Wait a bit for DNS to start propagating
            log('', 'reset');
            logInfo('Waiting 30 seconds for DNS to start propagating...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            // Test DNS resolution
            await testDNSResolution(confirmedDomain);
        }
        
        // Close readline interface
        rl.close();
        
    } catch (error) {
        logError(`Fatal error: ${error.message}`);
        rl.close();
        process.exit(1);
    }
}

// Export functions for testing
module.exports = {
    configureRangoonsDNS,
    testDNSResolution,
    makeGodaddyRequest,
    promptForDomain,
    testAPICredentials
};

// Run if called directly
if (require.main === module) {
    main();
}
