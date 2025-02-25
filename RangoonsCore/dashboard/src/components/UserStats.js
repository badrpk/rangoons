import React from 'react';

const UserStats = ({ users, activeUsers }) => {
    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', margin: '10px' }}>
            <h2>User Statistics</h2>
            <p>Total Users: {users}</p>
            <p>Active Users: {activeUsers}</p>
        </div>
    );
};

export default UserStats;
