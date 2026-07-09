import { FileText, Check, X } from "lucide-react";

import Button from "../Button";

import StatusBadge from "./StatusBadge";
import ConfidenceBar from "./ConfidenceBar";

export default function ApprovalCard({ item }) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl px-8 py-7 shadow-sm">

      <div className="grid grid-cols-5 items-center">

        {/* PO */}

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">

            <FileText
              className="w-6 h-6 text-slate-500"
            />

          </div>

          <div>

            <p className="font-bold text-xl">
              {item.po}
            </p>

          </div>

        </div>

        {/* Status */}

        <StatusBadge
          status={item.status}
        />

        {/* Confidence */}

        <ConfidenceBar
          confidence={item.confidence}
          level={item.level}
        />

        {/* Amount */}

        <h2 className="text-3xl font-bold">

          LKR {item.amount}

        </h2>

        {/* Buttons */}

        <div className="flex justify-end gap-3">

          {item.status === "Pending" ? (

            <>

              <button className="text-slate-400 hover:text-red-500">

                <X size={24} />

              </button>

              <Button>

                <Check
                  className="w-4 h-4 mr-2"
                />

                Approve

              </Button>

            </>

          ) : (

            <Button variant="outline">

              View Details

            </Button>

          )}

        </div>

      </div>

    </div>

  );

}