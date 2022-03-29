import './App.css';
import {Button, Col, Form, Input, Radio, Row, Space} from "antd";
import {useState} from "react";
import _ from "lodash";
import BigNumber from "bignumber.js";

const initialValues = {
  seller: 'Tom',
  type: '老客户推荐',
  referer: '',
  searchEngine: '',
  searchKeyword: '',
  products: [{
    productName: '',
    unitPrice: '',
    amount: ''
  }],
  totalPrice: 0
}

const formItemLayout = {
  // labelCol: {
  //   xs: { span: 24 },
  //   sm: { span: 4 },
  // },
  // wrapperCol: {
  //   xs: { span: 24 },
  //   sm: { span: 20 },
  // },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 8 },
  },
};

function App() {
  const [form] = Form.useForm();
  const [totalPrice, setTotalPrice] = useState(0)
  const computedTotalPrice = () => {
    const products = form.getFieldValue('products');
    if (Array.isArray(products)) {
      const _totalPrice = products.reduce((prev, cur) => {
        const {unitPrice, amount} = cur || {};
        const unitPriceBigVal = new BigNumber(unitPrice)
        const amountPriceBigVal = new BigNumber(amount)
        if (!unitPriceBigVal.isNaN() && !amountPriceBigVal.isNaN()) {
          return new BigNumber(prev).plus(unitPriceBigVal.multipliedBy(amountPriceBigVal))
        } else {
          return prev
        }
      }, new BigNumber(0));
      setTotalPrice(_totalPrice.toFormat(2))
    }
  }

  const setRowTotalPrice = () => {
    const values = form.getFieldsValue();
    const _products = _.get(values, 'products', []);
    const products = _products.map(item =>{
      const unitPriceBigVal = new BigNumber(_.get(item, 'unitPrice', 0));
      const totalPriceBigVal = unitPriceBigVal.multipliedBy(_.get(item, 'amount', 0))
      return {
        ...item,
        totalPrice: totalPriceBigVal.isNaN() ? 0 : totalPriceBigVal.toFormat(2)
      }
    })
    form.setFieldsValue({
      products
    })
  }

  const onFinish = (values) => {
    const type = _.get(values, 'type');
    let from = {};
    if (type === '老客户推荐') {
      from = _.pick(values, ['referer', 'type'])
    } else if (type === '搜索') {
      from = _.pick(values, ['searchEngine', 'searchKeyword', 'type'])
    } else if (type === '其他') {
      from = _.pick(values, ['type'])
    }
    const needFields = _.pick(values, ['seller', 'totalPrice']);
    const products = _.get(values, 'products', []).map(item => {
      const {productName, amount, unitPrice} = item;
      return {
        productName,
        amount: new BigNumber(amount).toNumber(),
        unitPrice: new BigNumber(unitPrice).toNumber()
      }
    })
    const result = _.merge(needFields, {
      from,
      products,
      totalPrice
    });
    console.log(JSON.stringify(result, null, 2))
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <div className='App'>
      <h1>创建订单</h1>
      <Form
        labelCol={{
          span: 3
        }}
        wrapperCol={{
          span: 21
        }}
        form={form}
        onChange={e => {
          computedTotalPrice()
        }}
        name="创建订单"
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="销售员"
          name="seller"
          rules={[
            {
              required: true,
              message: '必填',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={'客户来源'}
          name="type"
          rules={[
            { required: true, message: '必填' }
          ]}
        >
          <Radio.Group>
            <Radio value="老客户推荐">老客户推荐</Radio>
            <Radio value="搜索">搜索</Radio>
            <Radio value="其他">其他</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) =>
            getFieldValue('type') === '老客户推荐' ? (
              <Form.Item
                label="推荐人"
                name="referer"
                rules={[
                  {
                    required: true,
                    message: '必填',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) =>
            getFieldValue('type') === '搜索' ? (
              <>
                <Form.Item
                  label={'搜索引擎'}
                  name="searchEngine"
                  rules={[ {required: true, message: '必填'} ]}
                >
                  <Radio.Group>
                    <Radio value="百度">百度</Radio>
                    <Radio value="360">360</Radio>
                    <Radio value="搜狗">搜狗</Radio>
                    <Radio value="其他">其他</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="关键词"
                  name="searchKeyword"
                  rules={[
                    {
                      required: true,
                      message: '必填',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>

        <Form.Item
          label={'商品明细'}
          required={true}
        >
          <Row gutter={10} className={'products-title'}>
            <Col span={6}>商品名</Col>
            <Col span={5}>单价</Col>
            <Col span={5}>数量</Col>
            <Col span={6}>小计</Col>
            <Col span={2}/>
          </Row>
          <Form.List name='products'>
            {
              (fields, {add, remove}, {errors}) => {
                return <>
                  {
                    fields.map((field, index) => {
                      return <Row
                        gutter={10}
                        key={field.key}
                      >
                        <Col span={6}>
                          <Form.Item
                            name={[field.name, 'productName']}
                            rules={[{ required: true, message: '必填' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name={[field.name, 'unitPrice']}
                            onChange={setRowTotalPrice}
                            rules={[
                              { required: true, message: '必填' },
                              ({}) => ({
                                validator(_, val) {
                                  return checkPrice(val)
                                }
                              })
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name={[field.name, 'amount']}
                            onChange={setRowTotalPrice}
                            rules={[
                              { required: true, message: '必填' },
                              ({}) => ({
                                validator(_, val) {
                                  return checkPrice(val)
                                }
                              })
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item className='text-center'>
                            ¥ {_.get(form.getFieldValue('products'), `${field.name}.totalPrice`, 0)}
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            disabled={form.getFieldValue('products').length <= 1}
                            type={'link'}
                            onClick={() => {
                              remove(field.name)
                              computedTotalPrice()
                            }}>
                            删除
                          </Button>
                        </Col>
                      </Row>
                    })
                  }
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={() => add()}
                    >
                      添加商品
                    </Button>
                  </Form.Item>
                </>
              }
            }
          </Form.List>
        </Form.Item>

        <Form.Item
          label={'合计总价'}
          required
        >
          <span className='red'>
            ¥ {totalPrice} 元
          </span>
        </Form.Item>
        <Button className={'pull-right'} type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </div>
  );
}

function checkPrice(val) {
  const bigNumberVal = new BigNumber(val);
  if (bigNumberVal.isNaN()) {
    return Promise.reject(new Error('输入数字'))
  } else if (bigNumberVal.isLessThanOrEqualTo(0)) {
    return Promise.reject(new Error('需要大于0'))
  } else {
    return Promise.resolve()
  }
}

export default App;
