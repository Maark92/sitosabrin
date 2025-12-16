/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";

interface PortfolioItem {
    id: string;
    image_url: string;
    title?: string;
}

interface PortfolioProps {
    portfolio: PortfolioItem[];
}

export function PortfolioGrid({ portfolio = [] }: PortfolioProps) {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-stone-200 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-light text-stone-800">Portfolio</h2>
                        <p className="text-stone-500">I nostri ultimi lavori</p>
                    </div>
                    <Button variant="outline" className="text-stone-600 border-stone-300">
                        Guarda tutto su Instagram
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 min-h-[300px]">
                    {portfolio.length === 0 ? (
                        <div className="col-span-full text-center text-stone-400 py-20 italic">
                            Caricamento lavori... (o nessun lavoro presente)
                        </div>
                    ) : (
                        portfolio.map((item, index) => (
                            <div
                                key={item.id}
                                className={`group overflow-hidden rounded-md relative aspect-square bg-stone-100 ${index % 3 === 1 ? 'md:row-span-2 md:aspect-[1/2]' : ''}`}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.title || `Lavoro ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
