// example Layout.js
import React from 'react'

export default ({ children }) =>
<div>
    <h2>Tip</h2>
    <div
        style={{
          backgroundColor: 'lime'
        }}>

        {children}
    </div>
</div>
