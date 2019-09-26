// example Layout.js
import React from 'react'

export default ({ children }) =>
<div>
    <h2 style={{ backgroundColor: 'tomato' }}>Pitfall</h2>
    <div style={{ textAlign: 'left' }}>
        {children}
    </div>
</div>
