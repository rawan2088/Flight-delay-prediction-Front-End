import React from "react";
import { Clock, TrendingUp, Plane } from "lucide-react";
import type { Feature } from "../types";
import Reveal from "./Reveal";

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Clock className="w-8 h-8 text-blue-400" />,
      title: "Real-Time Predictions",
      description:
        "Get instant delay predictions based on current conditions and historical data patterns.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
      title: "High Accuracy",
      description: "Our AI model is trained to provide reliable predictions.",
    },
    {
      icon: <Plane className="w-8 h-8 text-blue-400" />,
      title: "Easy to Use",
      description:
        "Simply enter your flight details and get predictions in seconds. No complicated setup required.",
    },
  ];

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Why use FlightPredict?
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 150}>
              <div className="h-full bg-slate-900/40 backdrop-blur-md p-8 rounded-xl border border-slate-700/70 hover:border-blue-500 transition-colors">
                <div className="w-14 h-14 bg-blue-500/15 rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-400">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
