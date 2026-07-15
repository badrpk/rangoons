const https = require('https');
const readline = require('readline');

// Porkbun API Configuration
const PORKBUN_API_KEY = 'pk1_1cbdd6744bd2857132ac1e03b0e2b0d0a7cd964d3aeab7fb1a36f296a1da388c';
let PORKBUN_SECRET_KEY = ''; // Will be prompted for
const DOMAIN = 'rangoons.my';
const STATIC_IP = '154.57.212.38';

// Porkbun API endpoints
const PORKBUN_API_BASE = 'https://porkbun.com/api/json/v3';

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

// Prompt user for secret key
function promptForSecretKey() {
    return new Promise((resolve) => {
        log('', 'reset');
        log('🔑 Porkbun Secret API Key Required', 'bright');
        log('====================================', 'bright');
        log('', 'reset');
        logInfo('To get your Secret API Key:');
        log('1. Login to https://porkbun.com', 'cyan');
        log('2. Go to Account → API Access', 'cyan');
        log('3. Copy your Secret API Key (starts with sk1_)', 'cyan');
        log('', 'reset');
        
        rl.question('Enter your Porkbun Secret API Key: ', (secretKey) => {
            if (secretKey.trim()) {
                PORKBUN_SECRET_KEY = secretKey.trim();
                logSuccess('Secret API Key received!');
                resolve(true);
            } else {
                logError('Secret API Key cannot be empty!');
                resolve(false);
            }
        });
    });
}

// Make HTTPS request to Porkbun API
function makePorkbunRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            apikey: PORKBUN_API_KEY,
            secretapikey: PORKBUN_SECRET_KEY,
            ...data
        });

        const options = {
            hostname: 'porkbun.com',
            port: 443,
            path: `/api/json/v3${endpoint}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Rangoons-DNS-Config/1.0'
            }
        };

        logInfo(`Making API request to: ${endpoint}`);
        logInfo(`Request data: ${JSON.stringify({ apikey: PORKBUN_API_KEY.substring(0, 20) + '...', secretapikey: PORKBUN_SECRET_KEY.substring(0, 20) + '...', ...data })}`);

        const req = https.request(options, (res) => {
            let responseData = '';
            
            logInfo(`Response status: ${res.statusCode} ${res.statusMessage}`);
            logInfo(`Response headers: ${JSON.stringify(res.headers)}`);
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                logInfo(`Response body: ${responseData.substring(0, 200)}${responseData.length > 200 ? '...' : ''}`);
                
                if (res.statusCode === 403) {
                    logError('❌ 403 Forbidden - This usually means:');
                    logError('   - API key or secret key is incorrect');
                    logError('   - API access is not enabled for your account');
                    logError('   - Domain ownership verification issue');
                    logError('   - Rate limiting or IP restriction');
                    reject(new Error(`403 Forbidden: ${responseData}`));
                    return;
                }
                
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                    return;
                }
                
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Test API credentials first
async function testAPICredentials() {
    try {
        logInfo('🧪 Testing API credentials...');
        const response = await makePorkbunRequest('/ping');
        
        if (response.status === 'SUCCESS') {
            logSuccess('✅ API credentials are valid!');
            return true;
        } else {
            logError(`❌ API test failed: ${response.message}`);
            return false;
        }
    } catch (error) {
        logError(`❌ API test error: ${error.message}`);
        return false;
    }
}

// Get current DNS records
async function getCurrentDNSRecords() {
    try {
        logInfo('Fetching current DNS records...');
        const response = await makePorkbunRequest(`/dns/retrieve/${DOMAIN}`);
        
        if (response.status === 'SUCCESS') {
            logSuccess(`Found ${response.records.length} DNS records`);
            return response.records;
        } else {
            logError(`Failed to retrieve DNS records: ${response.message}`);
            return [];
        }
    } catch (error) {
        logError(`Error retrieving DNS records: ${error.message}`);
        return [];
    }
}

// Create or update DNS record
async function createOrUpdateDNSRecord(record) {
    try {
        const endpoint = record.id ? `/dns/edit/${DOMAIN}/${record.id}` : `/dns/create/${DOMAIN}`;
        const data = record.id ? record : record;
        
        const response = await makePorkbunRequest(endpoint, data);
        
        if (response.status === 'SUCCESS') {
            const action = record.id ? 'updated' : 'created';
            logSuccess(`DNS record ${action}: ${record.name || '@'} → ${record.content}`);
            return true;
        } else {
            logError(`Failed to ${record.id ? 'update' : 'create'} DNS record: ${response.message}`);
            return false;
        }
    } catch (error) {
        logError(`Error ${record.id ? 'updating' : 'creating'} DNS record: ${error.message}`);
        return false;
    }
}

// Configure DNS records for Rangoons
async function configureRangoonsDNS() {
    log('🚀 Configuring DNS Records for Rangoons Edge Computing System', 'bright');
    log('================================================================', 'bright');
    
    // Test API credentials first
    const credentialsValid = await testAPICredentials();
    if (!credentialsValid) {
        logError('❌ API credentials test failed. Please check your keys and try again.');
        return false;
    }
    
    // Get current records
    const currentRecords = await getCurrentDNSRecords();
    
    // Define required DNS records
    const requiredRecords = [
        {
            name: '@',
            type: 'A',
            content: STATIC_IP,
            ttl: '300',
            notes: 'Rangoons Primary Server'
        },
        {
            name: 'www',
            type: 'A',
            content: STATIC_IP,
            ttl: '300',
            notes: 'Rangoons WWW Subdomain'
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
            record.name === requiredRecord.name && record.type === requiredRecord.type
        );
        
        if (existingRecord) {
            if (existingRecord.content === requiredRecord.content) {
                logSuccess(`Record already correct: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
                successCount++;
            } else {
                logWarning(`Updating existing record: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
                requiredRecord.id = existingRecord.id;
                if (await createOrUpdateDNSRecord(requiredRecord)) {
                    successCount++;
                }
            }
        } else {
            logInfo(`Creating new record: ${requiredRecord.name || '@'} → ${requiredRecord.content}`);
            if (await createOrUpdateDNSRecord(requiredRecord)) {
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
        log('3. Test with: http://www.rangoons.my', 'cyan');
        log('4. Your edge computing system will be accessible externally!', 'cyan');
        
        log('', 'reset');
        log('🔍 Test DNS propagation:', 'bright');
        log(`   nslookup www.rangoons.my`, 'cyan');
        log(`   ping www.rangoons.my`, 'cyan');
        log(`   curl -I http://www.rangoons.my`, 'cyan');
        
        return true;
    } else {
        logError('❌ Some DNS records failed to configure');
        return false;
    }
}

// Test DNS resolution
async function testDNSResolution() {
    log('', 'reset');
    log('🧪 Testing DNS Resolution', 'bright');
    log('==========================', 'bright');
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
        exec(`nslookup www.${DOMAIN}`, (error, stdout, stderr) => {
            if (error) {
                logError(`DNS lookup failed: ${error.message}`);
                resolve(false);
                return;
            }
            
            if (stdout.includes(STATIC_IP)) {
                logSuccess(`✅ DNS resolution working: www.${DOMAIN} → ${STATIC_IP}`);
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
        log('🌐 Rangoons DNS Configuration Tool', 'bright');
        log('==================================', 'bright');
        log(`Domain: ${DOMAIN}`, 'cyan');
        log(`Static IP: ${STATIC_IP}`, 'cyan');
        log(`Porkbun API: ${PORKBUN_API_KEY.substring(0, 20)}...`, 'cyan');
        log('', 'reset');
        
        // Prompt for secret key
        const secretKeyReceived = await promptForSecretKey();
        if (!secretKeyReceived) {
            logError('❌ Secret API Key is required to continue');
            rl.close();
            process.exit(1);
        }
        
        // Configure DNS
        const dnsSuccess = await configureRangoonsDNS();
        
        if (dnsSuccess) {
            // Wait a bit for DNS to start propagating
            log('', 'reset');
            logInfo('Waiting 30 seconds for DNS to start propagating...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            // Test DNS resolution
            await testDNSResolution();
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
    makePorkbunRequest,
    promptForSecretKey,
    testAPICredentials
};

// Run if called directly
if (require.main === module) {
    main();
}
