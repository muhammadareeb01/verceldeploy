
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Hook to render markdown content with enhanced formatting
 * @returns A function that renders markdown content as React elements
 */
export const useMarkdown = () => {
  const renderMarkdown = (content: string) => {
    if (!content) return null;
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
          ),
          p: (props) => (
            <p className="mb-4" {...props} />
          ),
          ul: (props) => (
            <ul className="mb-4 ml-6 list-disc" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-4 ml-6 list-decimal" {...props} />
          ),
          li: (props) => (
            <li className="mb-1" {...props} />
          ),
          a: (props) => (
            <a className="text-blue-600 hover:underline" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="pl-4 border-l-4 border-gray-300 italic my-4" {...props} />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-4" {...props} />
          ),
          hr: (props) => (
            <hr className="my-6 border-gray-200" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-gray-200" {...props} />
          ),
          tr: (props) => (
            <tr {...props} />
          ),
          th: (props) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
          ),
          td: (props) => (
            <td className="px-3 py-2 whitespace-nowrap" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return { renderMarkdown };
};

export default useMarkdown;
