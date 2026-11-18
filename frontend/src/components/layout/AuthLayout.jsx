
function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
                        <span className="text-3xl font-bold text-teal-400">S</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Support<span className="text-teal-400">AI</span>
                    </h1>

                    <p className="text-slate-400 text-sm mt-2">
                        Intelligent Customer Support Platform
                    </p>
                </div>

                {/* Authentication Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                    <h2 className="text-2xl font-semibold text-white">
                        {title}
                    </h2>

                    <p className="text-slate-400 text-sm mt-2 mb-7">
                        {subtitle}
                    </p>

                    {children}

                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    © {new Date().getFullYear()} SupportAI. All rights reserved.
                </p>

            </div>
        </div>
    );
}

export default AuthLayout;
