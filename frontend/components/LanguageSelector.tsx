'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select<string>
        value={currentLanguage}
        onChange={handleLanguageChange}
        variant="outlined"
      >
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 