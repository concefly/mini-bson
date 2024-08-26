import { serialize } from '../src';
import { BSON } from 'bson';

it.each([
  [{ a: 1 }],
  [{ ab: 1.23 }],
  [{ a: 1, b: 'cat', c: 3.14, d: true, e: false, f: null, g: undefined }],
  [{ a: [1, 2, 3.14] }],
  [{ a: [1, 2, 3.14], b: { c: 'cat', d: 3.14, e: true, f: false, g: null, h: undefined } }],
])('serialize %s', input => {
  const bin = serialize(input);

  expect(bin).toBeInstanceOf(Uint8Array);
  expect(bin.length).toBeGreaterThan(0);

  const parsed = BSON.deserialize(bin);
  expect(parsed).toEqual(input);
});

it('complex object', () => {
  const data = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Complex JSON Example',
    timestamp: '2024-08-23T10:31:19Z',
    details: {
      description: 'This is a complex JSON structure for demonstration purposes.',
      tags: ['example', 'complex', 'json'],
      statistics: {
        views: 10234,
        likes: 256,
        comments: [
          {
            user: 'user1',
            message: 'Great example!',
            timestamp: '2024-08-22T14:12:00Z',
          },
          {
            user: 'user2',
            message: 'Very helpful, thanks!',
            timestamp: '2024-08-22T15:45:30Z',
          },
        ],
      },
      metadata: {
        createdBy: 'ChatGPT',
        createdAt: '2024-08-23T10:31:19Z',
        updatedBy: 'ChatGPT',
        updatedAt: '2024-08-23T10:31:19Z',
      },
    },
    items: [
      {
        id: 1,
        type: 'book',
        title: 'Understanding JSON',
        author: {
          name: 'John Doe',
          bio: 'John Doe is a software engineer with over 10 years of experience.',
        },
        price: 29.99,
        availability: 'in stock',
        reviews: [
          {
            user: 'reviewer1',
            rating: 5,
            comment: 'A must-read for anyone working with JSON.',
          },
          {
            user: 'reviewer2',
            rating: 4,
            comment: 'Very informative and well-written.',
          },
        ],
      },
      {
        id: 2,
        type: 'video',
        title: 'Advanced JSON Techniques',
        duration: '2h 30m',
        instructor: {
          name: 'Jane Smith',
          bio: 'Jane Smith is a data scientist and a JSON expert.',
        },
        price: 49.99,
        availability: 'available',
        reviews: [
          {
            user: 'reviewer3',
            rating: 5,
            comment: 'Excellent course with lots of practical examples.',
          },
          {
            user: 'reviewer4',
            rating: 3,
            comment: 'Good content, but a bit too advanced for beginners.',
          },
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'JSON Official Website',
        url: 'https://www.json.org',
      },
      {
        title: 'MDN Web Docs on JSON',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
      },
    ],
    settings: {
      theme: 'dark',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        tracking: false,
        dataSharing: true,
      },
    },
  };

  const bin = serialize(data);
  expect(BSON.deserialize(bin)).toEqual(data);
});
