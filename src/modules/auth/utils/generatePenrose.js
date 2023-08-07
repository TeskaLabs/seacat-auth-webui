import { useEffect, useState, useLayoutEffect } from "react";

export default function generatePenrose() {
	const [size, setSize] = useState([0,0])
	
	const generateBackground = () =>{
		const script = document.createElement('script');
		script.id = "bg-script";
		script.src = "./media/login-bg.js";
		script.async = true;
		document.body.appendChild(script);
		
		return () => {
			document.body.removeChild(script);
		};
	}

	useLayoutEffect(()=> {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		
		return () => window.removeEventListener('resize', updateSize);
	}, [])

	useEffect(() => {
		const bgScript = document.getElementById("bg-script");
		if (bgScript) bgScript.remove();
		const removeBackground = generateBackground();
		return () => {
			removeBackground();
		};

	}, [size])

	return null; 
}