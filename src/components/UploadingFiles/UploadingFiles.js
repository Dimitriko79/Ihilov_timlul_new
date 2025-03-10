import React from "react";

const UploadingFiles = ({uploadingFile, selectedFileName}) => {

    if (uploadingFile || selectedFileName === '') return null;

    return (
        <div
            className='bg-[#0069361e] border border-[#006937] text-[#006937] px-4 py-3 rounded relative mb-4 text-right'
            role='alert'
        >
            <span className='block sm:inline ' style={{ direction: "rtl", display: "flex" }}>{`הקובץ שהועלה:  ${selectedFileName}`}</span>
        </div>
    )
}

export default UploadingFiles;