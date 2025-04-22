import React from 'react';

const HeroSvg: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.9"/>
      </linearGradient>
      <clipPath id="screenMask">
        <rect x="110" y="70" width="580" height="380" rx="20" />
      </clipPath>
    </defs>
    
    {/* Background Elements */}
    <circle cx="650" cy="120" r="80" fill="url(#gradient1)" opacity="0.1" />
    <circle cx="150" cy="500" r="100" fill="url(#gradient1)" opacity="0.1" />
    <circle cx="400" cy="300" r="150" fill="url(#gradient1)" opacity="0.05" />
    
    {/* CV Document */}
    <rect x="110" y="70" width="580" height="380" rx="20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
    
    {/* CV Content */}
    <g clipPath="url(#screenMask)">
      {/* Header */}
      <rect x="110" y="70" width="580" height="80" fill="#F9FAFB" />
      <circle cx="170" cy="110" r="30" fill="#4F46E5" />
      <rect x="220" y="95" width="200" height="12" rx="6" fill="#111827" />
      <rect x="220" y="115" width="150" height="10" rx="5" fill="#6B7280" />
      
      {/* Content */}
      <rect x="130" y="170" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="195" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="215" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="235" width="540" height="10" rx="5" fill="#E5E7EB" />
      
      <rect x="130" y="270" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="295" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="315" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="335" width="540" height="10" rx="5" fill="#E5E7EB" />
      
      <rect x="130" y="370" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="395" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="415" width="540" height="10" rx="5" fill="#E5E7EB" />
    </g>
    
    {/* Animated Elements */}
    <circle cx="750" cy="200" r="15" fill="#4F46E5" opacity="0.7">
      <animate attributeName="cy" values="200;180;200" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="350" r="10" fill="#7C3AED" opacity="0.7">
      <animate attributeName="cy" values="350;370;350" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="400" cy="500" r="12" fill="#4F46E5" opacity="0.7">
      <animate attributeName="cy" values="500;520;500" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default HeroSvg; 