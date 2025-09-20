import React from "react";

export default class DebugBoundary extends React.Component {
  constructor(p){ super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error("💥 ErrorBoundary:", error, info); }
  render(){
    if (this.state.error){
      return (
        <div style={{padding:20,fontFamily:"monospace",whiteSpace:"pre-wrap"}}>
          <h2>💥 UI crashed</h2>
          {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
