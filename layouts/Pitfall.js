// example Layout.js
import React from 'react'

export default ({ children }) =>
<div>
    <h2>Pitfall</h2>
    <div
        style={{
          backgroundColor: 'tomato'
        }}>

        {children}
    </div>
</div>
