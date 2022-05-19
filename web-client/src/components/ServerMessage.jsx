import React from 'react';

export default function ServerMessage({ username, message, timeStamp }) {
	return (
		<div className='message'>
			<div className={`flex-1 text-center`}>
				<p className='text-sm font-semibold'>server</p>
			</div>
			<div
				className={`bg-opacity-50 rounded-md shadow-md px-2 py-0.5 mb-4 bg-sky-500 mx-0 lg:mx-10`}
			>
				<div className={`flex items-center px-4 py-2 bg-transparent`}>
					<div className='flex-1'>
						<p className={`text-sm text-center break-words`}>
							{message}
						</p>
					</div>
				</div>
				<div className='flex-1 text-right'>
					<p className={`text-xs text-gray-600 text-center`}>
						{timeStamp.substring(0, 5)}
					</p>
				</div>
			</div>
		</div>
	);
}
