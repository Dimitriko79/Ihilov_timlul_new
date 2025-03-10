import React from "react";

const Error = ({ error }) => {

    if (!error) return null;
    return (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-3 rounded relative text-right' role='alert'>
            <span className='block sm:inline'>{error}</span>
        </div>
    )
}

export default Error;