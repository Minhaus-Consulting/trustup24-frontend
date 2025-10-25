import{c as m,r as h,j as e,B as a,g as t,N as l,O as c,P as o,be as f}from"./index-48Pj72Q3.js";import{T as u,a as g,b as j,c as b}from"./tabs-DDUjb8uk.js";import y from"./KostenRechner-C6EPoxY6.js";import w from"./AnbieterVergleichen-CYa33kgT.js";import{A as N}from"./AgencyCard-BbwwEmQ7.js";import{D as v}from"./download-BsM3dSQ9.js";import"./select-CZxI7kd3.js";import"./chevron-up-D_xeGbNE.js";import"./checkbox-Dj13i6OQ.js";import"./calculator-Cc0ZEdNb.js";import"./info-CD95J74i.js";import"./LoadingSpinner-BHyMGtwr.js";import"./plus-B7150RY6.js";import"./TrustMeter-ZWpWOuiA.js";import"./external-link-CuzHQmay.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=m("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=m("Palette",[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]]);function L(){const[r,n]=h.useState("desktop"),d={id:"1",name:"Setup Excellence Dubai",description:"Premium Business Setup",services:["mainland","freezone"],specializations:["it","consulting"],languages:["de","en","ar"],teamSize:"10-20",established:2020,rating:4.8,reviewCount:127,responseTime:"fast",priceRange:"medium",verified:!0,trusted:!0,licenses:["DED","DMCC"],image:""},x={desktop:"w-full",tablet:"max-w-[768px] mx-auto",mobile:"max-w-[375px] mx-auto"},i=[{name:"Homepage",component:e.jsx(f,{})},{name:"Kostenrechner",component:e.jsx(y,{})},{name:"Anbieter Vergleich",component:e.jsx(w,{})},{name:"Agency Card",component:e.jsx("div",{className:"p-4",children:e.jsx(N,{agency:d})})}],p=()=>{alert("Screenshots werden generiert. Diese können dann in Figma importiert werden.")};return e.jsx("div",{className:"min-h-screen bg-gray-50",children:e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsxs("div",{className:"mb-8 text-center",children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Design Showcase für Figma"}),e.jsx("p",{className:"text-gray-600 mb-6",children:"Alle Seiten in verschiedenen Viewport-Größen zum Export"}),e.jsxs("div",{className:"flex justify-center gap-4 mb-6",children:[e.jsxs(a,{onClick:p,className:"gap-2",children:[e.jsx(k,{className:"h-4 w-4"}),"Screenshots generieren"]}),e.jsxs(a,{variant:"outline",className:"gap-2",children:[e.jsx(C,{className:"h-4 w-4"}),"Design Tokens exportieren"]})]})]}),e.jsxs(u,{defaultValue:"Homepage",className:"w-full",children:[e.jsx(g,{className:"grid grid-cols-4 w-full max-w-2xl mx-auto mb-8",children:i.map(s=>e.jsx(j,{value:s.name,children:s.name},s.name))}),i.map(s=>e.jsx(b,{value:s.name,children:e.jsxs(t,{children:[e.jsx(l,{children:e.jsxs(c,{className:"flex items-center justify-between",children:[e.jsx("span",{children:s.name}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(a,{size:"sm",variant:r==="desktop"?"default":"outline",onClick:()=>n("desktop"),children:"Desktop"}),e.jsx(a,{size:"sm",variant:r==="tablet"?"default":"outline",onClick:()=>n("tablet"),children:"Tablet"}),e.jsx(a,{size:"sm",variant:r==="mobile"?"default":"outline",onClick:()=>n("mobile"),children:"Mobile"})]})]})}),e.jsxs(o,{children:[e.jsx("div",{className:`border rounded-lg overflow-hidden ${x[r]}`,children:e.jsx("div",{className:"bg-white",children:s.component})}),e.jsxs("div",{className:"mt-4 p-4 bg-gray-100 rounded",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Export-Info für Figma:"}),e.jsxs("ul",{className:"text-sm text-gray-600 space-y-1",children:[e.jsxs("li",{children:["• Viewport: ",r==="desktop"?"1440px":r==="tablet"?"768px":"375px"]}),e.jsx("li",{children:"• Komponenten: Tailwind CSS + Shadcn/UI"}),e.jsx("li",{children:"• Farben: Primary (#3b82f6), Secondary (#64748b)"}),e.jsx("li",{children:"• Font: System UI Stack"})]})]})]})]})},s.name))]}),e.jsxs(t,{className:"mt-8",children:[e.jsx(l,{children:e.jsx(c,{children:"Design Tokens für Figma"})}),e.jsxs(o,{children:[e.jsx("pre",{className:"bg-gray-100 p-4 rounded overflow-x-auto text-sm",children:`{
  "colors": {
    "primary": "#3b82f6",
    "primary-hover": "#2563eb",
    "secondary": "#64748b",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "background": "#ffffff",
    "foreground": "#0f172a",
    "muted": "#f1f5f9",
    "border": "#e2e8f0"
  },
  "spacing": {
    "xs": "0.5rem",
    "sm": "1rem",
    "md": "1.5rem",
    "lg": "2rem",
    "xl": "3rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  }
}`}),e.jsxs(a,{className:"mt-4 gap-2",children:[e.jsx(v,{className:"h-4 w-4"}),"Als JSON exportieren"]})]})]})]})})}export{L as default};
