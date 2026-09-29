import React from 'react'

const Loader = () => {
  return (
    <section className='min-h-screen w-full flex justify-center items-center bg-gray-800'>
        <div className=' flex flex-row items-center gap-3 text-sm text-gray-200'>
            <span className='loader '></span>
            <p>Just a sec...</p>
        </div>
    </section>
  )
}

export default Loader