import React from 'react';

// Themed SVG icon for the brand
const WatermelonIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M5,50 A45,45 0 0,1 95,50" fill="#4A934A" />
        <path d="M10,50 A40,40 0 0,1 90,50" fill="#67C767" />
        <path d="M15,50 A35,35 0 0,1 85,50" fill="#F25F5C" />
        <circle cx="35" cy="55" r="3" fill="#333" />
        <circle cx="50" cy="58" r="3" fill="#333" />
        <circle cx="65" cy="55" r="3" fill="#333" />
    </svg>
);

export default WatermelonIcon;
