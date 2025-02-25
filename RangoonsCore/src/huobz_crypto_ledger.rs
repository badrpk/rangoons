use polars::prelude::*;
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
struct Block {
    index: u32,
    timestamp: u64,
    transactions: Vec<Transaction>,
    previous_hash: String,
    hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Transaction {
    sender: String,
    receiver: String,
    amount: f64,
}

impl Block {
    fn new(index: u32, transactions: Vec<Transaction>, previous_hash: String) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let data = format!("{:?}{:?}{:?}", index, transactions, previous_hash);
        let hash = format!("{:x}", Sha256::digest(data.as_bytes()));

        Block {
            index,
            timestamp,
            transactions,
            previous_hash,
            hash,
        }
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a Genesis Block
    let genesis_block = Block::new(0, vec![], String::from("0"));

    // Example Transactions
    let transactions = vec![
        Transaction { sender: "Alice".into(), receiver: "Bob".into(), amount: 50.0 },
        Transaction { sender: "Bob".into(), receiver: "Charlie".into(), amount: 25.0 },
    ];

    // Create a new Block
    let block = Block::new(1, transactions.clone(), genesis_block.hash.clone());

    // Store transactions in a DataFrame
    let df = df![
        "Sender" => transactions.iter().map(|t| t.sender.clone()).collect::<Vec<_>>(),
        "Receiver" => transactions.iter().map(|t| t.receiver.clone()).collect::<Vec<_>>(),
        "Amount" => transactions.iter().map(|t| t.amount).collect::<Vec<_>>()
    ]?;

    println!("\n🔗 Blockchain Ledger:");
    println!("{:?}", block);
    println!("\n📊 Transaction Data:");
    println!("{}", df);

    Ok(())
}
