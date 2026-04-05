import { renderToPipeableStream } from "react-dom/server";
import { Form, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { isbot } from "isbot";
import { PassThrough } from "node:stream";
import { jsx, jsxs } from "react/jsx-runtime";
import { Calendar, ChevronLeft, Info, MapPin, Search, Sliders, Users, Vote } from "lucide-react";
import { useEffect, useState } from "react";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region app/entry.server.tsx
var entry_server_exports = /* @__PURE__ */ __exportAll({ default: () => handleRequest });
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const userAgent = request.headers.get("user-agent");
		const readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url,
			abortDelay: ABORT_DELAY
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = new ReadableStream({ start(controller) {
					body.on("data", (chunk) => controller.enqueue(chunk));
					body.on("end", () => controller.close());
					body.on("error", (err) => controller.error(err));
				} });
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, ABORT_DELAY);
	});
}
//#endregion
//#region app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	Layout: () => Layout,
	default: () => root_default
});
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {})
		] }), /* @__PURE__ */ jsxs("body", {
			className: "min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-blue-500 selection:text-white",
			children: [
				children,
				/* @__PURE__ */ jsx(ScrollRestoration, {}),
				/* @__PURE__ */ jsx(Scripts, {})
			]
		})]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
//#endregion
//#region app/components/CountdownTimer.tsx
function CountdownTimer({ endTime, label }) {
	const [timeLeft, setTimeLeft] = useState(null);
	useEffect(() => {
		const target = new Date(endTime).getTime();
		const interval = setInterval(() => {
			const distance = target - (/* @__PURE__ */ new Date()).getTime();
			if (distance < 0) {
				clearInterval(interval);
				setTimeLeft({
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
				return;
			}
			setTimeLeft({
				days: Math.floor(distance / (1e3 * 60 * 60 * 24)),
				hours: Math.floor(distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)),
				minutes: Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60)),
				seconds: Math.floor(distance % (1e3 * 60) / 1e3)
			});
		}, 1e3);
		return () => clearInterval(interval);
	}, [endTime]);
	if (!timeLeft) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-onehalf-dark p-6 rounded-2xl border-4 border-neutral-800 shadow-xl text-center",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "text-xl font-bold text-onehalf-blue mb-4 uppercase tracking-wider",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-4 gap-4",
			children: [
				{
					label: "Days",
					value: timeLeft.days
				},
				{
					label: "Hours",
					value: timeLeft.hours
				},
				{
					label: "Minutes",
					value: timeLeft.minutes
				},
				{
					label: "Seconds",
					value: timeLeft.seconds
				}
			].map((item) => /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-3xl md:text-5xl font-black text-onehalf-green",
					children: item.value
				}), /* @__PURE__ */ jsx("span", {
					className: "text-xs md:text-sm text-neutral-400 uppercase",
					children: item.label
				})]
			}, item.label))
		})]
	});
}
//#endregion
//#region app/components/AddressInput.tsx
function AddressInput() {
	const [address, setAddress] = useState("");
	const navigate = useNavigate();
	useEffect(() => {
		const storedAddress = localStorage.getItem("address");
		if (storedAddress) setAddress(storedAddress);
	}, []);
	const handleSubmit = (e) => {
		e.preventDefault();
		if (address.trim()) {
			localStorage.setItem("address", address.trim());
			navigate(`/voterinfo?address=${encodeURIComponent(address.trim())}`);
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "relative group max-w-2xl w-full",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none",
				children: /* @__PURE__ */ jsx(MapPin, { className: "h-8 w-8 text-onehalf-blue" })
			}),
			/* @__PURE__ */ jsx("input", {
				type: "text",
				placeholder: "Enter your address for local info...",
				className: "block w-full pl-16 pr-24 py-8 bg-onehalf-dark border-4 border-neutral-800 rounded-3xl text-2xl font-black text-white focus:outline-none focus:ring-8 focus:ring-onehalf-blue/20 focus:border-onehalf-blue transition-all",
				value: address,
				onChange: (e) => setAddress(e.target.value),
				required: true
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "submit",
				className: "absolute inset-y-2 right-2 px-8 flex items-center bg-onehalf-green text-neutral-900 rounded-2xl font-black text-xl uppercase tracking-tighter hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg",
				children: [/* @__PURE__ */ jsx(Search, { className: "h-6 w-6 mr-2" }), "Find"]
			})
		]
	});
}
//#endregion
//#region app/routes/home.tsx
var home_exports = /* @__PURE__ */ __exportAll({
	default: () => home_default,
	meta: () => meta
});
function meta({}) {
	return [{ title: "PLEASE VOTE™ | Your Source for Election Info" }, {
		name: "description",
		content: "Empowering voters with reliable information for every election."
	}];
}
var home_default = UNSAFE_withComponentProps(function Home() {
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 pt-12 md:pt-24 pb-32",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "relative overflow-hidden mb-12 p-12 md:p-32 rounded-[3rem] bg-onehalf-green border-8 border-neutral-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center group transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none min-h-[600px]",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "absolute top-12 left-12 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 pointer-events-none z-0",
					children: /* @__PURE__ */ jsx(Users, {
						size: 300,
						strokeWidth: 1,
						className: "text-neutral-900"
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute bottom-12 right-12 opacity-10 group-hover:opacity-20 transition-opacity -rotate-12 pointer-events-none z-0",
					children: /* @__PURE__ */ jsx(Vote, {
						size: 300,
						strokeWidth: 1,
						className: "text-neutral-900"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative z-10 flex flex-col items-center w-full space-y-16",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter uppercase leading-none",
							children: "Welcome to"
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "text-7xl md:text-[12rem] font-black text-neutral-900 font-sans drop-shadow-2xl uppercase tracking-tightest leading-[0.9]",
							children: ["PLEASE VOTE", /* @__PURE__ */ jsx("span", {
								className: "text-5xl align-top ml-4 font-normal",
								children: "™"
							})]
						}),
						/* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-neutral-900/10 rounded-full" }),
						/* @__PURE__ */ jsx("h5", {
							className: "text-2xl md:text-5xl font-black text-neutral-900/80 font-sans max-w-6xl leading-tight uppercase italic tracking-tighter",
							children: "Empowering voters with reliable information for every election."
						})
					]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start",
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:col-span-5",
				children: /* @__PURE__ */ jsx(CountdownTimer, {
					endTime: "2026-11-03T00:00:00",
					label: "2026 Midterm Elections Countdown"
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "lg:col-span-7 flex flex-col justify-center h-full space-y-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-8 bg-neutral-900 rounded-3xl border-4 border-neutral-800 shadow-2xl flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-4xl font-black mb-4 uppercase text-onehalf-blue",
							children: "Find Your Polling Info"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-neutral-400 text-lg mb-8 max-w-md",
							children: "Enter your street address to see upcoming local contests and candidates."
						}),
						/* @__PURE__ */ jsx(AddressInput, {})
					]
				})
			})]
		})]
	});
});
//#endregion
//#region app/lib/api.ts
var GOOGLE_CIVIC_API_KEY = process.env.GOOGLE_CIVIC_API_KEY;
var BASE_URL = "https://www.googleapis.com/civicinfo/v2";
async function fetchVoterInfo(address, electionId) {
	let url = `${BASE_URL}/voterinfo?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(address)}`;
	if (electionId) url += `&electionId=${electionId}`;
	const response = await fetch(url);
	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new Error(errorBody.error?.message || `Failed to fetch voter info: ${response.statusText}`);
	}
	return response.json();
}
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 3958.8;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
//#endregion
//#region app/routes/voterinfo.tsx
var voterinfo_exports = /* @__PURE__ */ __exportAll({
	default: () => voterinfo_default,
	loader: () => loader
});
async function loader({ request }) {
	const address = new URL(request.url).searchParams.get("address");
	if (!address) return { error: "No address provided" };
	try {
		return {
			data: await fetchVoterInfo(address),
			address
		};
	} catch (error) {
		return {
			error: error.message,
			address
		};
	}
}
var voterinfo_default = UNSAFE_withComponentProps(function VoterInfo() {
	const { data, error, address } = useLoaderData();
	const [searchParams] = useSearchParams();
	const radius = parseInt(searchParams.get("radius") || "5");
	const filteredPollingLocations = data?.pollingLocations?.filter((loc) => {
		if (!loc.latitude || !loc.longitude || !data.normalizedInput.line1) return true;
		if (data.normalizedInput && loc.latitude && loc.longitude) return calculateDistance(40.054, -83.022, loc.latitude, loc.longitude) <= radius;
		return true;
	});
	if (error) return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-24 text-center",
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: "text-6xl font-black text-red-500 mb-8 uppercase",
				children: "Error"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-2xl mb-12 text-neutral-400",
				children: error
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/",
				className: "px-12 py-6 bg-onehalf-blue text-neutral-950 font-black rounded-2xl uppercase hover:scale-105 transition-all inline-block",
				children: "Return Home"
			})
		]
	});
	if (!data) return null;
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-12",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-neutral-900 pb-12",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "flex items-center text-onehalf-blue font-black uppercase mb-4 hover:translate-x-[-4px] transition-transform",
					children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "mr-2" }), " Back to Home"]
				}),
				/* @__PURE__ */ jsxs("h1", {
					className: "text-6xl md:text-8xl font-black tracking-tightest uppercase mb-4",
					children: ["Voter Info", /* @__PURE__ */ jsx("span", {
						className: "text-onehalf-green",
						children: "."
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center text-2xl font-bold text-neutral-400",
					children: [/* @__PURE__ */ jsx(MapPin, { className: "mr-3 text-onehalf-blue" }), address]
				})
			] }), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-onehalf-dark p-6 rounded-3xl border-4 border-neutral-800",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-black uppercase tracking-widest text-neutral-500 mb-2",
							children: "Upcoming Election"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-2xl font-black text-onehalf-yellow uppercase",
							children: data.election.name
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-lg font-bold text-neutral-400 italic",
							children: data.election.electionDay
						})
					]
				}), /* @__PURE__ */ jsxs(Form, {
					method: "get",
					className: "bg-neutral-900 p-6 rounded-3xl border-4 border-neutral-800 flex flex-col justify-center",
					children: [
						/* @__PURE__ */ jsx("input", {
							type: "hidden",
							name: "address",
							value: address || ""
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 mb-2",
							children: [/* @__PURE__ */ jsx(Sliders, {
								size: 16,
								className: "text-onehalf-blue"
							}), /* @__PURE__ */ jsx("h3", {
								className: "text-sm font-black uppercase tracking-widest text-neutral-500",
								children: "Search Radius"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4",
							children: [/* @__PURE__ */ jsx("input", {
								type: "range",
								name: "radius",
								min: "1",
								max: "50",
								value: radius,
								onChange: (e) => {
									const form = e.target.form;
									if (form) form.requestSubmit();
								},
								className: "accent-onehalf-blue w-32"
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xl font-black text-white w-12",
								children: [radius, "mi"]
							})]
						})
					]
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ jsxs("section", {
				className: "lg:col-span-7 space-y-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-4 mb-8",
					children: [/* @__PURE__ */ jsx(Calendar, { className: "h-10 w-10 text-onehalf-green" }), /* @__PURE__ */ jsx("h2", {
						className: "text-4xl font-black uppercase tracking-tighter",
						children: "Your Ballot"
					})]
				}), data.contests?.map((contest, idx) => /* @__PURE__ */ jsxs("div", {
					className: "bg-neutral-900 rounded-[2rem] border-4 border-neutral-800 p-8 shadow-2xl hover:border-onehalf-blue/50 transition-colors",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex justify-between items-start mb-6",
						children: /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "px-4 py-1 bg-neutral-800 text-onehalf-blue text-xs font-black rounded-full uppercase tracking-widest mb-2 inline-block",
								children: contest.type
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-3xl font-black uppercase leading-none",
								children: contest.office || contest.referendumTitle
							}),
							contest.district && /* @__PURE__ */ jsxs("p", {
								className: "text-neutral-500 font-bold mt-2 uppercase text-sm",
								children: [
									contest.district.scope,
									" - ",
									contest.district.name
								]
							})
						] })
					}), contest.candidates ? /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4",
						children: contest.candidates.map((candidate, cIdx) => /* @__PURE__ */ jsxs("div", {
							className: "bg-onehalf-dark p-6 rounded-2xl border-2 border-neutral-800 flex flex-col items-center text-center group hover:border-onehalf-green/50 transition-all",
							children: [
								candidate.photoUrl ? /* @__PURE__ */ jsx("img", {
									src: candidate.photoUrl,
									alt: candidate.name,
									className: "w-24 h-24 rounded-full mb-4 border-4 border-neutral-800 object-cover"
								}) : /* @__PURE__ */ jsx("div", {
									className: "w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-4 border-4 border-neutral-800",
									children: /* @__PURE__ */ jsx(Users, {
										size: 40,
										className: "text-neutral-600"
									})
								}),
								/* @__PURE__ */ jsx("h4", {
									className: "text-xl font-black uppercase tracking-tight",
									children: candidate.name
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-bold text-onehalf-green uppercase tracking-widest",
									children: candidate.party || "No Party"
								})
							]
						}, cIdx))
					}) : /* @__PURE__ */ jsx("div", {
						className: "bg-onehalf-dark p-6 rounded-2xl border-2 border-neutral-800 italic text-neutral-500",
						children: contest.referendumSubtitle || "No candidates listed."
					})]
				}, idx))]
			}), /* @__PURE__ */ jsxs("aside", {
				className: "lg:col-span-5 space-y-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-4 mb-8",
					children: [/* @__PURE__ */ jsx(MapPin, { className: "h-10 w-10 text-onehalf-blue" }), /* @__PURE__ */ jsx("h2", {
						className: "text-4xl font-black uppercase tracking-tighter",
						children: "Where to Vote"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-6",
					children: filteredPollingLocations?.length ? filteredPollingLocations.map((loc, idx) => /* @__PURE__ */ jsxs("div", {
						className: "bg-onehalf-dark rounded-[2rem] border-4 border-neutral-800 p-8 shadow-xl relative overflow-hidden group",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity",
								children: /* @__PURE__ */ jsx(Info, { className: "text-onehalf-blue" })
							}),
							/* @__PURE__ */ jsx("h4", {
								className: "text-2xl font-black uppercase mb-4 text-onehalf-blue pr-8",
								children: loc.address.locationName
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xl font-bold text-white mb-2",
								children: loc.address.line1
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-neutral-400 font-bold mb-6",
								children: [
									loc.address.city,
									", ",
									loc.address.state,
									" ",
									loc.address.zip
								]
							}),
							loc.pollingHours && /* @__PURE__ */ jsxs("div", {
								className: "bg-neutral-900 p-4 rounded-xl border-2 border-neutral-800",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs font-black uppercase tracking-widest text-neutral-500 mb-1",
									children: "Hours"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-sm text-neutral-300 font-mono whitespace-pre-line",
									children: loc.pollingHours
								})]
							})
						]
					}, idx)) : /* @__PURE__ */ jsx("div", {
						className: "p-12 bg-neutral-900 rounded-[2rem] border-4 border-dashed border-neutral-800 text-center",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-2xl font-black text-neutral-600 uppercase",
							children: "No Locations Found"
						})
					})
				})]
			})]
		})]
	});
});
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-F6UAuLkU.js",
		"imports": ["/assets/jsx-runtime-DUewsXso.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/root-CT2oZDM-.js",
			"imports": ["/assets/jsx-runtime-DUewsXso.js"],
			"css": ["/assets/root-CiYqqlTf.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/home": {
			"id": "routes/home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/home-DSqQ4IPA.js",
			"imports": ["/assets/jsx-runtime-DUewsXso.js", "/assets/users-CErdsquC.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/voterinfo": {
			"id": "routes/voterinfo",
			"parentId": "root",
			"path": "voterinfo",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/voterinfo-BuALkkd-.js",
			"imports": ["/assets/jsx-runtime-DUewsXso.js", "/assets/users-CErdsquC.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-7aa7402d.js",
	"version": "7aa7402d",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"unstable_optimizeDeps": false,
	"unstable_passThroughRequests": false,
	"unstable_subResourceIntegrity": false,
	"unstable_trailingSlashAwareDataRequests": false,
	"unstable_previewServerPrerendering": false,
	"v8_middleware": false,
	"v8_splitRouteModules": false,
	"v8_viteEnvironmentApi": false
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/home": {
		id: "routes/home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: home_exports
	},
	"routes/voterinfo": {
		id: "routes/voterinfo",
		parentId: "root",
		path: "voterinfo",
		index: void 0,
		caseSensitive: void 0,
		module: voterinfo_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
