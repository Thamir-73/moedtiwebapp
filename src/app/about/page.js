import Image from 'next/image'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto bg-white py-0 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ">
        <div className="p-8 animate-fadeIn">
        
          <div className="flex flex-col-reverse md:flex-row-reverse items-center gap-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-right text-gray-800 dark:text-white">
                معدتي هو تطبيق يسهل عملية ايجار المعدات الثقيلة.
              </h2>
              <p className="mb-6 text-right text-gray-600 dark:text-gray-300">
                سواء كنت صاحب معدات ثقيلة ترغب بتأجيرها أو مقاول ترغب باستئجار معدات ثقيلة،
                معدتي يسهل عليك عملية الوصول بسهولة إلى الطرف الآخر بناء على حاجتك، والتفاوض
                بسلاسة مع الطرف الآخر
              </p>
              <button className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-[#c19b2e] transition-colors duration-300 float-right animate-bounce-slow">
                عرفني أكثر
              </button>
            </div>
            <div className="flex-1">
              <Image
                src="/rree4.png"
                alt="معدتي diagram"
                width={500}
                height={300}
                layout="responsive"
                className="mix-blend-multiply dark:mix-blend-normal dark:opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}