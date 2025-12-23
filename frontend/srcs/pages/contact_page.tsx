const gradientStyle = {
  backgroundImage:
    'linear-gradient(135deg, #114CEE 0%, #0F399F 30%, #000000 55%, #F78D00 80%)',
};

export default function ContactPage() {
  return (
    <div className='min-h-screen' style={gradientStyle}>
      <div className='mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12 text-white'>
        <header className='flex flex-col gap-4 rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur'>
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-white/70'>Support</p>
            <h1 className='text-3xl font-bold sm:text-4xl'>Contact us</h1>
            <p className='mt-2 max-w-3xl text-base text-white/80'>
              Do not hesitate to write us. We respond as quickly as possible—typically within 3 days.
            </p>
          </div>
        </header>

        <section className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='flex flex-col gap-4'>
            <div className='inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70'>
              Contact Information
            </div>
            <p className='max-w-2xl text-lg leading-relaxed text-white/80'>
              Please contuct us only during working time. We may not answer during holidays and days-off.
            </p>
            <div className='h-4' aria-hidden />
            <div className='divide-y divide-white/10 rounded-2xl border border-white/10 px-4 py-3 text-base leading-relaxed text-white/85 shadow-lg backdrop-blur'>
              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-white/90'>Telephone number</span>
                <span className='text-white/70'>0476-55-2080</span>
              </div>
              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-white/90'>Working time</span>
                <span className='text-white/70'>Monday-Friday 09:00-18:00</span>
              </div>
              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-white/90'>Email</span>
                <span className='text-white/70'>info@jaddress.com</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 text-base leading-relaxed text-white/85 shadow-2xl backdrop-blur'>
            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-white/70'>No response?</p>
              <h2 className='mt-1 text-2xl font-semibold text-white'>Haven&apos;t received a reply?</h2>
            </div>
            <p>
              We respond within 48 hours (weekdays) via <span className='font-semibold'>info@jaddress.com</span>.
              Please check your spam folder first.
            </p>
            <p>If still not received, contact us at:</p>
            <div className='space-y-2 rounded-xl border border-white/10 bg-white/5 p-4'>
              <p className='text-white'>Email: <span className='font-semibold'>t.jaddress@gmail.com</span></p>
              <p className='text-white'>Phone: <span className='font-semibold'>080-5054-4093</span></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
