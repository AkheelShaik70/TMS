
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getPublishedFAQs } from "../../services/faqService";

function CustomerFAQs() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [openFAQ, setOpenFAQ] = useState(null);

    const loadFAQs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPublishedFAQs();
            setFaqs(response.data || []);
        } catch (err) {
            console.error("Failed to load FAQs:", err);
            setError("Unable to load FAQs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFAQs();
    }, []);

    const categories = [
        "All",
        ...new Set(faqs.map((faq) => faq.category).filter(Boolean)),
    ];

    const filteredFAQs = faqs.filter((faq) => {
        const matchesSearch =
            faq.question?.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === "All" ||
            faq.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout title="Frequently Asked Questions">

            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        How can we help you?
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Find answers to common questions about SupportAI.
                    </p>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                selectedCategory === category
                                    ? "bg-teal-500 text-slate-950"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">
                        Loading FAQs...
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-5">
                        {error}
                        <button
                            onClick={loadFAQs}
                            className="block mt-3 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredFAQs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-slate-300 font-medium">
                            No FAQs found.
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                            Try another search or category.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFAQs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        setOpenFAQ(
                                            openFAQ === faq.id ? null : faq.id
                                        )
                                    }
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-800/50 transition"
                                >
                                    <span className="text-white font-medium">
                                        {faq.question}
                                    </span>

                                    <span className="text-teal-400 text-xl shrink-0">
                                        {openFAQ === faq.id ? "−" : "+"}
                                    </span>
                                </button>

                                {openFAQ === faq.id && (
                                    <div className="px-5 pb-5 border-t border-slate-800">
                                        <p className="text-slate-300 leading-7 whitespace-pre-line pt-4">
                                            {faq.answer}
                                        </p>

                                        <span className="inline-block mt-4 text-xs text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full">
                                            {faq.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </DashboardLayout>
    );
}

export default CustomerFAQs;
