use polars::prelude::*;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    // Create a DataFrame representing HuobzCoins transactions
    let df = df![
        "User" => ["Alice", "Bob", "Charlie", "David"],
        "HuobzCoins" => [150.0, 200.0, 350.5, 120.0]
    ]?;

    println!("Original Data:\n{}", df);

    // Filter users with HuobzCoins balance greater than 200
    let filtered_df = df.clone().lazy()
        .filter(col("HuobzCoins").gt(lit(200.0)))
        .collect()?;

    println!("\nFiltered Users (Balance > 200 HuobzCoins):\n{}", filtered_df);

    // Aggregate total balance in the dataset
    let total_balance: f64 = df.column("HuobzCoins")?.sum().unwrap();
    println!("\nTotal HuobzCoins in circulation: {:.2}", total_balance);

    Ok(())
}
