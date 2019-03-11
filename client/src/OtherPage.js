import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div>
            This is another page inside the app!
            <Link to="/">Go back to Home Page</Link>
        </div>
    );
};