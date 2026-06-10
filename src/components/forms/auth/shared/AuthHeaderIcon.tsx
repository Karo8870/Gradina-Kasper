import React from 'react';

type AuthHeaderIconProps = {
  children: React.ReactNode;
};

export const AuthHeaderIcon: React.FC<AuthHeaderIconProps> = ({ children }) => {
  return (
    <div className='bg-secondary-100 text-primary-900 mx-auto mb-7 flex size-24 items-center justify-center rounded-full'>
      {children}
    </div>
  );
};
