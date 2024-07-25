// eslint-disable-next-line no-unused-vars
import React from 'react'
import Sidebar from './Sidebar'
import Map from './map'

const Layout = () => {
  return (
    <div className="layout"> {/* Flex container */}
      <Sidebar />
      <Map />
    </div>
  );
};

export default Layout;