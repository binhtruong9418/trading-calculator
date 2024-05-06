import {Col, Form, Row, Typography, Radio, InputNumber, Button, Table} from "antd";
import {toast, Toaster} from "react-hot-toast";
import {useState} from "react";

interface ListAmountUsdt {
    risk: number
    entry: number
    amountUsdt: number
}

function App() {
    const [form] = Form.useForm()
    const [listAmountUsdt, setListAmountUsdt] = useState<ListAmountUsdt[]>([])

    const handleSubmit = (values: any) => {
        const {total, fee, setup, stop, type: stopType, listEntry} = values
        console.log(values)
        if (listEntry.every((entry: any) => entry.entry === 0 || entry.entry === undefined)) {
            return toast.error('Please enter the entry price')
        }
        if (stop === 0 || stop === undefined) {
            return toast.error('Please enter the stop price')
        }
        if (setup === 'long') {
            if (listEntry.every((entry: any) => entry.entry < stop) && stopType === "price") {
                return toast.error('Entry price must be less than stop price')
            }
            const data = listEntry.map((entry: any) => {
                const {risk, entry: entryPrice} = entry
                const totalStopAmountPercent = stopType === "price" ? entryPrice / stop - 1 : stop / 100
                const totalFeeAmountPercent = Number(fee) + 0.0005
                console.log(totalStopAmountPercent, totalFeeAmountPercent)
                const amountUsdt = (total * risk / 100) / (totalFeeAmountPercent + totalStopAmountPercent)
                return {
                    risk,
                    entry: entryPrice,
                    amountUsdt
                }
            })
            setListAmountUsdt(data)
        } else {
            if (listEntry.every((entry: any) => entry.entry > stop) && stopType === "price") {
                return toast.error('Entry price must be greater than stop price')
            }
            const data = listEntry.map((entry: any) => {
                const {risk, entry: entryPrice} = entry
                const totalStopAmountPercent = stopType === "price" ? stop / entryPrice - 1 : stop / 100
                const totalFeeAmountPercent = Number(fee) + 0.0005
                console.log(totalStopAmountPercent, totalFeeAmountPercent)
                const amountUsdt = (total * risk / 100) / (totalFeeAmountPercent + totalStopAmountPercent)
                return {
                    risk,
                    entry: entryPrice,
                    amountUsdt
                }
            })
            setListAmountUsdt(data)

        }
    }
    return (
        <div className={'w-full md:w-1/2 xl:w-1/3 mx-auto my-10'}>
            <Toaster/>
            <Typography.Title className={'text-center'}>
                Trading calculator
            </Typography.Title>
            <Form
                layout={'vertical'}
                form={form}
                onFinish={handleSubmit}
            >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            name="setup"
                            label={<div className={'font-bold text-lg'}>Setup</div>}
                            rules={[{required: true, message: 'Please select a setup'}]}
                            initialValue={'long'}
                        >
                            <Radio.Group>
                                <Radio.Button value="long">Long</Radio.Button>
                                <Radio.Button value="short">Short</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name={"total"}
                            label={<div className={'font-bold text-lg'}>Total (total amount of account)</div>}
                            rules={[{required: true, message: 'Please enter the total amount of your account'}]}
                            initialValue={300}
                        >
                            <InputNumber
                                className={'w-full border-black'}
                                min={0}
                                step={100}
                                max={1000000}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="fee"
                            label={<div className={'font-bold text-lg'}>Trading fee (%)</div>}
                            rules={[{required: true, message: 'Please select a trading fee'}]}
                            initialValue={'0.0002'}
                        >
                            <Radio.Group>
                                <Radio.Button value="0.0002">Limit (0.02%)</Radio.Button>
                                <Radio.Button value="0.0005">Market (0.05%)</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.List
                            name={'listEntry'}
                            initialValue={[{risk: 2, entry: 0}]}
                        >
                            {(fields, {add, remove}) => (
                                <>
                                    {fields.map(({key, name, ...restField}, index: number) => (
                                        <Row gutter={10} className={'flex items-center w-full'} key={key}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "risk"]}
                                                    label={<div className={'font-bold text-lg'}>Risk (%)</div>}
                                                    rules={[{
                                                        required: true,
                                                        message: 'Please enter the risk percentage'
                                                    }]}
                                                    initialValue={2}
                                                >
                                                    <InputNumber
                                                        className={'w-full border-black'}
                                                        min={0}
                                                        step={0.1}
                                                        max={100}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "entry"]}
                                                    label={<div className={'font-bold text-lg'}>Entry {index + 1}</div>}
                                                    rules={[{required: true, message: 'Please enter the entry price'}]}
                                                >
                                                    <InputNumber
                                                        className={'w-full border-black'}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} className={'flex justify-center'}>
                                                <Button
                                                    onClick={() => remove(name)}
                                                    type={"primary"}
                                                    shape={"circle"}
                                                    className={'w-8 h-8'}
                                                    danger={true}
                                                >
                                                    -
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            onClick={() => add()}
                                            type={"primary"}
                                        >
                                            Add entry
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name={"type"}
                            label={<div className={'font-bold text-lg'}>Stop type</div>}
                            initialValue={'price'}
                        >
                            <Radio.Group>
                                <Radio.Button value="price">Price</Radio.Button>
                                <Radio.Button value="percentage">Percentage</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name={"stop"}
                            label={<div className={'font-bold text-lg'}>Stop</div>}
                        >
                            <InputNumber
                                className={'w-full border-black'}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                {
                    listAmountUsdt.length > 0 && (
                        <div className={'mt-5'}>
                            <Typography.Title level={4}>
                                Amount USDT
                            </Typography.Title>
                            <Table
                                columns={[
                                    {
                                        title: 'Risk (%)',
                                        dataIndex: 'risk',
                                        key: 'risk'
                                    },
                                    {
                                        title: 'Entry',
                                        dataIndex: 'entry',
                                        key: 'entry'
                                    },
                                    {
                                        title: 'Amount USDT',
                                        dataIndex: 'amountUsdt',
                                        key: 'amountUsdt'
                                    }
                                ]}
                                bordered={true}
                                dataSource={listAmountUsdt}
                                pagination={false}
                            />
                        </div>
                    )
                }
                <Button
                    type={"primary"}
                    htmlType={"submit"}
                    className={'w-full'}
                >
                    Calculate
                </Button>
            </Form>
        </div>
    )
}

export default App
