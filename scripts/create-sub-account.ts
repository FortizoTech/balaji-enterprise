// @ts-ignore
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
    console.log('\n--- Modem Pay Sub-Account Creator (Split Payments) ---');
    console.log('This script creates a sub-account via the Modem Pay API.');
    console.log('The resulting Sub-Account ID should be added to your .env file as NEXT_PUBLIC_MODEM_PAY_SUB_ACCOUNT.\n');

    const modemPayMode = process.env.NEXT_PUBLIC_MODEM_PAY_MODE || 'test';
    const secretKey = modemPayMode === 'live'
        ? process.env.MODEM_PAY_LIVE_SECRET_KEY
        : process.env.MODEM_PAY_TEST_SECRET_KEY;

    if (!secretKey) {
        console.error(`ERROR: Missing Modem Pay secret key for ${modemPayMode} mode in .env`);
        process.exit(1);
    }

    console.log(`Using Modem Pay details for Mode: [${modemPayMode}]`);

    const businessName = await askQuestion('Business Name for sub-account (e.g. Partner Shop): ');
    const percentageInput = await askQuestion('Percentage of transaction to route to this account (e.g. 90 for 90%): ');
    const network = await askQuestion('Settlement Network (wave OR afrimoney): ');
    const accountNumber = await askQuestion('Account/Wallet number to receive funds: ');

    const percentage = parseInt(percentageInput);
    if (isNaN(percentage) || percentage <= 0 || percentage >= 100) {
        console.error('Invalid percentage. Must be between 1 and 99.');
        process.exit(1);
    }

    if (network !== 'wave' && network !== 'afrimoney') {
        console.error('Invalid network. Use "wave" or "afrimoney".');
        process.exit(1);
    }

    console.log('\nCreating sub-account with Modem Pay...');

    try {
        const response = await fetch('https://api.modempay.com/v1/sub-accounts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_name: businessName,
                percentage: percentage,
                settlement_code: network,
                account_number: parseInt(accountNumber)
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Sub-Account Created Successfully!');
            console.log('----------------------------------------------------');
            console.log('Sub-Account ID:', data.id);
            console.log('Business Name :', data.business_name);
            console.log('Percentage    :', data.percentage, '%');
            console.log('Settlement    :', data.settlement_code);
            console.log('Account No.   :', data.account_number);
            console.log('----------------------------------------------------');
            console.log(`\nNext Steps:`);
            console.log(`1. Open your .env file.`);
            console.log(`2. Add this line: NEXT_PUBLIC_MODEM_PAY_SUB_ACCOUNT="${data.id}"`);
            console.log(`3. Restart your Next.js server.`);
        } else {
            console.error('\n❌ Failed to create sub-account');
            console.error(data);
        }
    } catch (error) {
        console.error('\n❌ Network or API error occurred:');
        console.error(error);
    } finally {
        rl.close();
    }
}

main().catch(console.error);
