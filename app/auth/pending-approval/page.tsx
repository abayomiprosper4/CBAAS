'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PendingApproval() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardContent className="pt-10 pb-8 text-center">
          {/* Animated or steady clock icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Approval Pending
          </h1>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your admin registration has been submitted and is pending approval from the main administrator. 
            You will be notified via email once your account is approved.
          </p>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
            <div className="flex items-center justify-center mb-3">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
                What happens next?
              </span>
            </div>
            <ul className="text-sm text-slate-600 text-left space-y-3 px-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                The main admin will review your request
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                You will receive an email notification
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Once approved, you can log in with your credentials
              </li>
            </ul>
          </div>
          
          {/* Using 'asChild' with Link is the preferred Next.js way for buttons */}
          <Button
            asChild
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Link href="/auth/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}