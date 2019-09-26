// example Layout.js
import React from 'react'

export default ({ children }) =>
<div>
    <h2 style={{ 
        backgroundColor: 'lime',
        width: '80vw',
        textAlign: 'center',
    }}>Tip</h2>
    <div style={{ textAlign: 'left' }}>{children}</div>
</div>
