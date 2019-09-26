import React from 'react'
import { globalHistory } from '@reach/router'
import { Zoom, Slide, Clock } from '@mdx-deck/components'

export const Presenter = props => {
  const { slides, metadata, index } = props
  const Next = slides[index + 1]
  const { notes } = metadata[index] || {}

  return (
    <div style={{
      color: 'white',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      width: '100vw',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <Zoom zoom={1 / 4}>{props.children}</Zoom>
        </div>
        <div>
          <Zoom zoom={1 / 4}>
          {Next && (<Slide><Next /></Slide>)}
          </Zoom>
        </div>
      </div>
      <div>
        <div>
          <a style={{ color: 'white' }} target="_blank" rel="noopener noreferrer" href={globalHistory.location.origin + globalHistory.location.pathname}>
            Open New Window
          </a>
          <a style={{ fontSize: 30, color: 'white' }} href={slides.length - 4 + '?mode=presenter'}>
            END THIS!!!
          </a>
        </div>
        <div>
          <Clock />
        </div>
        <div style={{ fontSize: 30, color: 'white' }}>
          {notes}
        </div>
      </div>
    </div>
    )
}

export default Presenter
