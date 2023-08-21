import React, { useEffect } from 'react'

interface AlertProps {
	children: string
	/** Time in milliseconds before alert disappears */
	timeout?: number | false
	/** Called when timeout expires. Should use to remove `helperText` and make the component disappear. */
	callback?: () => void
}

const Alert: React.FC<AlertProps> = ({
	children,
	timeout = 2000,
	callback,
}: AlertProps) => {
	useEffect(() => {
		if (timeout === false) return
		const timer = setTimeout(() => {
			document.getElementsByClassName('alert')[0].classList.add('hidden')
			setTimeout(() => {
				if (callback) {
					callback()
				}
				document.getElementsByClassName('alert')[0].classList.remove('hidden')
			}, 250)
		}, timeout)
		return () => clearTimeout(timer)
	}, [callback, timeout])

	return (
		<div className="alert" data-hidden={!children}>
			<strong>{children}</strong>
		</div>
	)
}

export default Alert
