import React from 'react';

const TransactionsWidget = ({ transactions }) => {
    return (
        <div className="bg-white shadow p-4 m-4 rounded">
            <h2 className="text-lg font-bold">Transactions</h2>
            <p>Total Transactions: {transactions}</p>
        </div>
    );
};

export default TransactionsWidget;
