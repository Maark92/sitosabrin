import React from 'react';
import { Award, Sparkles, ShieldCheck, Clock } from 'lucide-react';

const IconMap: Record<string, any> = {
    Award: Award,
    Sparkles: Sparkles,
    ShieldCheck: ShieldCheck,
    Clock: Clock
};

interface Feature {
    id: string; // Changed to string to match Supabase UUID
    title: string;
    description: string;
    icon_name: string;
}

interface FeaturesProps {
    features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesProps> = ({ features = [] }) => {
    return (
        <section id="chi-siamo" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-rose-950 mb-4">Perché sceglierci</h2>
                <div className="w-24 h-1 bg-rose-300 mx-auto rounded-full mb-6"></div>
                <p className="text-rose-800/70 max-w-2xl mx-auto">
                    Non siamo solo un salone, siamo un laboratorio di bellezza dove la salute delle tue unghie è la priorità assoluta.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {features.map((feature) => {
                    const IconComponent = IconMap[feature.icon_name] || Sparkles; // Access snake_case property
                    return (
                        <div key={feature.id} className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white hover:shadow-soft transition-colors duration-300">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-inner rotate-3 hover:rotate-6 transition-transform">
                                <IconComponent size={32} />
                            </div>
                            <h3 className="font-serif text-2xl text-rose-900 mb-3">{feature.title}</h3>
                            <p className="text-rose-950/60 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
