import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] pt-20 sm:pt-24">
            <span className="inline-flex items-center">
                Loading
                <span className="ml-1 flex gap-1">
                    <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                    <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                    <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                </span>
            </span>
        </div>
    );
};

export default Loader; 