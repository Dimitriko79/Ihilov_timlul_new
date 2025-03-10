import React from "react";

const Header = () => {

    return (
        <div className='w-full md:h-[70px] lg:h-[100px] pt-2 pb-2 pr-4 pl-4 border-b-2 border-blue-500'>
            <img src='/logo.svg' alt='logo' className='h-[100%] ml-auto'/>
        </div>
    )
}

export default Header;